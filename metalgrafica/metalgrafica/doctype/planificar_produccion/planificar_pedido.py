# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt

from __future__ import unicode_literals
import frappe, erpnext
import datetime
from frappe.utils import cstr, flt, cint, nowdate, add_days, comma_and

from frappe import msgprint, _

from frappe.model.document import Document
from erpnext.manufacturing.doctype.bom.bom import validate_bom_no
from erpnext.manufacturing.doctype.production_order.production_order import get_item_details


@frappe.whitelist()
def get_all_nodes(bom_no):
	'''Recursively gets all data from tree nodes'''
	parent = bom_no
	frappe.local.form_dict.parent = parent
	data = get_children()
	out = [dict(parent=parent, data=data)]

	to_check = [d.value for d in data if d.expandable]
	while to_check:
		frappe.local.form_dict.parent = to_check.pop()
		data = get_children()
		out.append(dict(parent=frappe.local.form_dict.parent, data=data))
		for d in data:
			if d.expandable:
				to_check.append(d.value)

	return out

@frappe.whitelist()
def get_children():
	if frappe.form_dict.parent:
		return frappe.db.sql("""select
			bom_item.item_code,
			bom_item.bom_no as value,
			bom_item.stock_qty,
			if(ifnull(bom_item.bom_no, "")!="", 1, 0) as expandable,
			item.image,
			item.description
			from `tabBOM Item` bom_item, tabItem item
			where bom_item.parent=%s
			and bom_item.item_code = item.name
			order by bom_item.idx
			""", frappe.form_dict.parent, as_dict=True)

def get_so_wise_planned_qty(bom_no, planned_qty, sales_order):
	"""
		bom_dict {
			bom_no: ['sales_order', 'qty']
		}
	"""
	bom_dict = {}
	bom_dict.setdefault(bom_no, []).append([sales_order, flt(planned_qty)])

	return bom_dict

@frappe.whitelist()
def raise_material_requests(bom_no, planned_qty, sales_order, alternative_default_warehouse, create_material_requests_for_all_required_qty=1):
	"""
		Raise Material Request if projected qty is less than qty required
		Requested qty should be shortage qty considering minimum order qty
	"""
	if not alternative_default_warehouse:
		frappe.throw(_("Please enter Warehouse for which Material Request will be raised"))

	bom_dict = get_so_wise_planned_qty(bom_no, planned_qty, sales_order)
	item_dict = get_raw_materials(bom_dict, alternative_default_warehouse, 1)

	#return item_dict

	if item_dict:
		create_material_request(item_dict, alternative_default_warehouse, int(create_material_requests_for_all_required_qty))

def get_raw_materials(bom_dict,alternative_default_warehouse, create_material_requests_for_all_required_qty,non_stock_item=0, use_multi_level_bom=1, only_raw_materials=0,include_subcontracted=0):
	""" Get raw materials considering sub-assembly items
		{
			"item_code": [qty_required, description, stock_uom, min_order_qty]
		}
	"""
	item_list = []


	for bom, so_wise_qty in bom_dict.items():
		bom_wise_item_details = {}
		if use_multi_level_bom and only_raw_materials and include_subcontracted:
			# get all raw materials with sub assembly childs
			# Did not use qty_consumed_per_unit in the query, as it leads to rounding loss
			for d in frappe.db.sql("""select fb.item_code,
				ifnull(sum(fb.stock_qty/ifnull(bom.quantity, 1)), 0) as qty,
				fb.description, fb.stock_uom, item.min_order_qty, item.default_warehouse
				from `tabBOM Explosion Item` fb, `tabBOM` bom, `tabItem` item
				where bom.name = fb.parent and item.name = fb.item_code
				and (item.is_sub_contracted_item = 0 or ifnull(item.default_bom, "")="")
				""" + ("and item.is_stock_item = 1","")[non_stock_item] + """
				and fb.docstatus<2 and bom.name=%(bom)s
				group by fb.item_code, fb.stock_uom""", {"bom":bom}, as_dict=1):
					bom_wise_item_details.setdefault(d.item_code, d)

		else:
			# Get all raw materials considering SA items as raw materials,
			# so no childs of SA items
			bom_wise_item_details = get_subitems(bom_wise_item_details, bom,1, \
				use_multi_level_bom,only_raw_materials, include_subcontracted, alternative_default_warehouse, create_material_requests_for_all_required_qty, non_stock_item)

		for item, item_details in bom_wise_item_details.items():
			if item_details.default_material_request_type == "Purchase" and item_details.is_sub_contracted:
				for so_qty in so_wise_qty:
					#frappe.throw("{0} - {1} - {2}".format(so_qty[0], flt(so_qty[1]), item_details.qty))
					item_list.append([item, flt(item_details.qty) * flt(so_qty[1]), item_details.description,
							item_details.stock_uom, item_details.min_order_qty, so_qty[0], item_details.default_warehouse])
		

	item_dict = {}
	item_dict = make_items_dict(item_dict, item_list)

	return item_dict

	
def get_subitems(bom_wise_item_details, bom, parent_qty, include_sublevel, only_raw, supply_subs, alternative_default_warehouse, create_material_requests_for_all_required_qty=0, non_stock_item=0):
	items = frappe.db.sql("""
			SELECT
				bom_item.item_code,
				default_material_request_type,
				ifnull(%(parent_qty)s * sum(bom_item.stock_qty/ifnull(bom.quantity, 1)), 0) as qty,
				item.is_sub_contracted_item as is_sub_contracted,
				item.default_bom as default_bom,
				bom_item.description as description,
				bom_item.stock_uom as stock_uom,
				item.min_order_qty as min_order_qty,
				item.default_warehouse
			FROM
				`tabBOM Item` bom_item,
				`tabBOM` bom,
				tabItem item
			where
				bom.name = bom_item.parent
				and bom.name = %(bom)s
				and bom_item.docstatus < 2
				and bom_item.item_code = item.name
			""" + ("and item.is_stock_item = 1", "")[non_stock_item] + """
			group by bom_item.item_code""", {"bom": bom, "parent_qty": parent_qty}, as_dict=1)

	for d in items:
		
		if ((d.default_material_request_type == "Purchase"
			and not (d.is_sub_contracted and only_raw and include_sublevel))
			or (d.default_material_request_type == "Manufacture" and not only_raw)):

			if d.item_code in bom_wise_item_details:
				bom_wise_item_details[d.item_code].qty = bom_wise_item_details[d.item_code].qty + d.qty
			else:
				bom_wise_item_details[d.item_code] = d

		if include_sublevel and d.default_bom:
			if ((d.default_material_request_type == "Purchase" and d.is_sub_contracted and supply_subs)
				or (d.default_material_request_type == "Manufacture")):
				my_qty = 0
				projected_qty = get_item_projected_qty(d.item_code, d.default_warehouse, alternative_default_warehouse)

				if create_material_requests_for_all_required_qty:
					my_qty = d.qty
				else:
					total_required_qty = flt(bom_wise_item_details.get(d.item_code, frappe._dict()).qty)
					if (total_required_qty - d.qty) < projected_qty:
						my_qty = total_required_qty - projected_qty
					else:
						my_qty = d.qty

				if my_qty > 0:
					get_subitems(bom_wise_item_details,
						d.default_bom, my_qty, include_sublevel, only_raw, supply_subs, alternative_default_warehouse, create_material_requests_for_all_required_qty, non_stock_item)


	return bom_wise_item_details


def get_item_projected_qty(item,default_warehouse, alternative_default_warehouse):
	conditions = ""
	#if self.purchase_request_for_warehouse:
	conditions = " and warehouse='{0}'".format(frappe.db.escape(default_warehouse or alternative_default_warehouse))

	item_projected_qty = frappe.db.sql("""
		select ifnull(sum(projected_qty),0) as qty
		from `tabBin`
		where item_code = %(item_code)s {conditions}
	""".format(conditions=conditions), { "item_code": item }, as_dict=1)

	return item_projected_qty[0].qty

def make_items_dict(item_dict, item_list):
	
	for i in item_list:
		item_dict.setdefault(i[0], []).append([flt(i[1]), i[2], i[3], i[4], i[5], i[6]])

	return item_dict

def create_material_request(item_dict, alternative_default_warehouse, create_material_requests_for_all_required_qty):
	items_to_be_requested = get_requested_items(item_dict, create_material_requests_for_all_required_qty, alternative_default_warehouse)
	material_request_list = []
	if items_to_be_requested:
		for item in items_to_be_requested:
			item_wrapper = frappe.get_doc("Item", item)		
			if (item_wrapper.default_material_request_type == "Purchase"  and item_wrapper.is_sub_contracted_item) or 1==1:
				material_request = frappe.new_doc("Material Request")
				material_request.update({
					"transaction_date": nowdate(),
					"status": "Draft",
					"company": erpnext.get_default_company(),
					"requested_by": frappe.session.user,
					"schedule_date": add_days(nowdate(), cint(item_wrapper.lead_time_days)),
				})
				material_request.update({"material_request_type": item_wrapper.default_material_request_type})

				for sales_order, requested_qty in items_to_be_requested[item].items():
					material_request.append("items", {
						"doctype": "Material Request Item",
						"__islocal": 1,
						"item_code": item,
						"item_name": item_wrapper.item_name,
						"description": item_wrapper.description,
						"uom": item_wrapper.stock_uom,
						"item_group": item_wrapper.item_group,
						"brand": item_wrapper.brand,
						"qty": requested_qty,
						"schedule_date": add_days(nowdate(), cint(item_wrapper.lead_time_days)),
						"warehouse": item_wrapper.default_warehouse or alternative_default_warehouse,
						"sales_order": sales_order if sales_order!="No Sales Order" else None,
						"project": frappe.db.get_value("Sales Order", sales_order, "project") \
							if sales_order!="No Sales Order" else None,
						"planned_start_date": datetime.datetime.now() #TODO
					})

				material_request.flags.ignore_permissions = 1
				material_request.submit()
				material_request_list.append(material_request.name)

		if material_request_list:
			message = ["""<a href="#Form/Material Request/%s" target="_blank">%s</a>""" % \
				(p, p) for p in material_request_list]
			msgprint(_("Material Requests {0} created").format(comma_and(message)))
	else:
		msgprint(_("Nothing to request"))

def get_requested_items(item_dict, create_material_requests_for_all_required_qty, alternative_default_warehouse):
	items_to_be_requested = frappe._dict()

	if not create_material_requests_for_all_required_qty:
		item_projected_qty = get_projected_qty(item_dict, alternative_default_warehouse)

	for item, so_item_qty in item_dict.items():
		total_qty = sum([flt(d[0]) for d in so_item_qty])
		requested_qty = 0

		if create_material_requests_for_all_required_qty:
			requested_qty = total_qty
		elif total_qty > item_projected_qty.get(item, 0):
			# shortage
			requested_qty = total_qty - flt(item_projected_qty.get(item))
			# consider minimum order qty

		if requested_qty and requested_qty < flt(so_item_qty[0][3]):
			requested_qty = flt(so_item_qty[0][3])

		# distribute requested qty SO wise
		for item_details in so_item_qty:
			if requested_qty:
				sales_order = item_details[4] or "No Sales Order"
				if requested_qty <= item_details[0]:
					adjusted_qty = requested_qty
				else:
					adjusted_qty = item_details[0]
				#frappe.throw("{0}".format(item))
				items_to_be_requested.setdefault(item, {}).setdefault(sales_order, 0)
				items_to_be_requested[item][sales_order] += adjusted_qty
				requested_qty -= adjusted_qty
			else:
				break

		# requested qty >= total so qty, due to minimum order qty
		if requested_qty:
			items_to_be_requested.setdefault(item, {}).setdefault("No Sales Order", 0)
			items_to_be_requested[item]["No Sales Order"] += requested_qty
	#frappe.throw("{0}".format(items_to_be_requested))
	return items_to_be_requested


def get_projected_qty(item_dict, purchase_request_for_warehouse):
	items = item_dict.keys()
	warehouses = []
	for item in item_dict:
		warehouses.append(item_dict[item][0][5])

	conditions = ""
	for cond in items:
		conditions = conditions + """ or (item_code="%s" and warehouse="%s")""" % (cond, item_dict[cond][0][5] or purchase_request_for_warehouse)

	sqlquery = """select item_code, sum(projected_qty)
		from `tabBin` where (0 = 1 {0}) group by item_code""".format(conditions)

	item_projected_qty = frappe.db.sql(sqlquery)

	return dict(item_projected_qty)