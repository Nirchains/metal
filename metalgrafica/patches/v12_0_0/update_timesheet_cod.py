# -*- coding: utf-8 -*-

# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt

from __future__ import unicode_literals
import frappe

def execute():
	frappe.reload_doctype('Timesheet')
	frappe.reload_doctype('Timesheet Extra')

	for d in frappe.get_all('Timesheet Extra',
		fields = ['name','activity_type']):
		
		print("Actualizando {0}".format(d.name))

		actividad = frappe.db.get_all('Actividades de mantenimiento', ['name'], {
			'activity_type': d.activity_type
			})

		if actividad:
			cod = actividad[0].name

			frappe.db.set_value('Timesheet Extra', d.name, 'activity_cod', cod)

	
	frappe.db.commit()
