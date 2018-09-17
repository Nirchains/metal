# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt

from __future__ import unicode_literals
import frappe
import frappe.defaults
from frappe import _
from frappe.utils import cstr, cint, flt, comma_or, getdate, nowdate, formatdate, format_time
from erpnext.stock.utils import get_incoming_rate
from erpnext.stock.stock_ledger import get_previous_sle, NegativeStockError
from erpnext.stock.get_item_details import get_bin_details, get_default_cost_center, get_conversion_factor
from erpnext.stock.doctype.batch.batch import get_batch_no, set_batch_nos, set_batch_nos_multiple
from erpnext.manufacturing.doctype.bom.bom import validate_bom_no
import json

@frappe.whitelist()
def get_item_qty_required(item_code, production_order, fg_completed_qty, s_warehouse, t_warehouse):
	pro_doc = frappe._dict()
	qty_required = 0
	if str(production_order) != '':
		pro_doc = frappe.get_doc('Production Order', production_order)
		item_dict = get_pending_raw_materials(production_order, pro_doc, fg_completed_qty, s_warehouse, t_warehouse)
		for d in item_dict:
			if item_dict[d].get('item_code') == item_code:
				qty_required = flt(item_dict[d].get('qty'))
	else:
		frappe.msgprint("La generaci&oacute;n de lotes no est&aacute; disponible para esta operaci&oacute;n")
	return qty_required

def get_pro_order_required_items(production_order, s_warehouse, t_warehouse):
	item_dict = frappe._dict()
	pro_order = frappe.get_doc("Production Order", production_order)
	if not frappe.db.get_value("Warehouse", pro_order.wip_warehouse, "is_group"):
		wip_warehouse = pro_order.wip_warehouse
	else:
		wip_warehouse = None
		
	for d in pro_order.get("required_items"):
		if (flt(d.required_qty) > flt(d.transferred_qty)) or s_warehouse == 'Trabajo en proceso - MDS':
			item_row = d.as_dict()
			if d.source_warehouse and not frappe.db.get_value("Warehouse", d.source_warehouse, "is_group"):
				item_row["from_warehouse"] = d.source_warehouse
			
			item_row["to_warehouse"] = wip_warehouse
			item_dict.setdefault(d.item_code, item_row)
		
	return item_dict

@frappe.whitelist()
def get_pending_raw_materials(production_order, pro_doc, fg_completed_qty, s_warehouse, t_warehouse):
	"""
		issue (item quantity) that is pending to issue or desire to transfer,
		whichever is less
	"""
	item_dict = get_pro_order_required_items(production_order, s_warehouse, t_warehouse)

	max_qty = flt(pro_doc.qty)
	for item, item_details in item_dict.items():
		pending_to_issue = flt(item_details.required_qty) - flt(item_details.transferred_qty)
		desire_to_transfer = flt(fg_completed_qty) * flt(item_details.required_qty) / max_qty

		if desire_to_transfer <= pending_to_issue:
			item_dict[item]["qty"] = desire_to_transfer
		elif pending_to_issue > 0:
			item_dict[item]["qty"] = pending_to_issue
		else:
			item_dict[item]["qty"] = 0

	# delete items with 0 qty
	for item in item_dict.keys():
		if not item_dict[item]["qty"]:
			del item_dict[item]

	# show some message
	if not len(item_dict):
		frappe.msgprint(_("""All items have already been transferred for this Production Order."""))

	return item_dict