# -*- coding: utf-8 -*-
# Copyright (c) 2013, Pedro Antonio Fernandez Gomez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import getdate
from datetime import timedelta

def execute(filters=None):
	data, columns = get_data(filters)
	return columns, data, None , None

def get_data(filters):
	conditions = " 1 = 1 "
	order_by = ""
	columns = []
	group_by = "group by"

	columns.append({"label": _("Item"),"fieldname": "item_code","fieldtype": "Link","options":"Item","width": 450})
	columns.append({"label": _("Qty"), "fieldname": "qty", "fieldtype": "Float", "width": 120, "convertible": "qty"})
	columns.append({"label": _("Stock Seguridad"), "fieldname": "safety_stock", "fieldtype": "Float", "width": 150, "convertible": "safety_stock"})
	columns.append({"label": _("Diferencia"), "fieldname": "diferencia", "fieldtype": "Float", "width": 150, "convertible": "diferencia"})
	columns.append({"label": _("Stock UOM"), "fieldname": "stock_uom", "fieldtype": "Link", "options": "UOM", "width": 100})
	columns.append({"label": _("Warehouse"), "fieldname": "warehouse", "fieldtype": "Link", "options": "Warehouse", "width": 150})

	if filters.get("item_code"):
		conditions += " and sle.item_code = %s " % (frappe.db.escape(filters.get("item_code")))

	if filters.get("warehouse"):
		conditions += " and sle.warehouse = %s " % (frappe.db.escape(filters.get("warehouse")))

	if filters.get("item_group"):
		conditions += " and it.item_group = %s " % (frappe.db.escape(filters.get("item_group")))		

	sql = """
		select sle.item_code, sle.warehouse, round(sum(sle.actual_qty),2) as qty, sle.stock_uom, it.safety_stock
			from `tabStock Ledger Entry` sle
				INNER JOIN `tabItem` it on sle.item_code = it.name
			where
				%(conditions)s
				group by sle.item_code, sle.warehouse
				order by it.item_group, sle.item_code
		""" % {
			"conditions": conditions
		}

	sql = """ select item_code, warehouse, qty, stock_uom, safety_stock, (qty - safety_stock) as diferencia from (%(sql)s) q order by diferencia asc
		""" % {	"sql": sql	}

	l_result = frappe.db.sql(sql, as_dict=1)

	return l_result, columns