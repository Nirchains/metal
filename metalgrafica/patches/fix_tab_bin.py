# Copyright (c) 2013, Web Notes Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt

from __future__ import unicode_literals
import frappe
from erpnext.stock.stock_balance import repost_stock

def execute():
	print("comenzando")
	bins = frappe.db.sql("""select item_code, warehouse, count(*) from `tabBin` 
		group by item_code, warehouse""", as_dict=True)
		
	for d in bins:
		print("leyendo")
		try:
			frappe.db.sql("delete from tabBin where item_code=%s and warehouse=%s", (d.item_code, d.warehouse))
		
			repost_stock(d.item_code, d.warehouse, allow_zero_rate=True, only_actual=False, only_bin=False)
			
			frappe.db.commit()
			print("completado")
		except:
			print("ha fallado")
			frappe.db.rollback()