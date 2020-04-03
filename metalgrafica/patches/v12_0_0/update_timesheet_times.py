# -*- coding: utf-8 -*-

# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt

from __future__ import unicode_literals
import frappe

def execute():
	frappe.reload_doctype('Timesheet')
	frappe.reload_doctype('Timesheet Extra')

	for d in frappe.get_all('Timesheet',
		fields = ['name', 'activities_time'],
		filters={'work_order': ('!=', ''), 'docstatus': ('!=', 2)}):
		print("Actualizando {0}".format(d.name))

		timesheet_extra = frappe.db.get_all('Timesheet Extra', ['time_in_mins'], {
			'parent': d.name,
			'activity_type': 'PRODUCCIÓN'
		})

		productive_time = 0
		for wo in timesheet_extra:
			productive_time += int(wo.get('time_in_mins'))

		unproductive_time = 0

		try:
			unproductive_time = int(d.activities_time) - productive_time
			frappe.db.set_value('Timesheet', d.name, 'unproductive_time', unproductive_time)
		except Exception as e:
			pass
		else:
			pass
		finally:
			pass
		

		print("Tiempo productivo: {0}".format(productive_time))

		#if not production_time and frappe.flags.in_patch: return

		frappe.db.set_value('Timesheet', d.name, 'productive_time', productive_time)
		

		#frappe.db.sql("""UPDATE `tabTimesheet`
        #    SET
        #        `tabTimesheet`.productive_time = %s
        #    WHERE
        #        `tabTimesheet`.name = %s""", (productive_time, d.name))
	
	frappe.db.commit()
