# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt

from __future__ import unicode_literals
import frappe
from frappe import scrub
from frappe.model.utils.rename_field import rename_field

def execute():
	frappe.reload_doctype("Timesheet")
	print("Actualizando...")
	frappe.db.sql(""" update `tabTimesheet` set work_order = production_order """)
	print(" ... actualizado")
