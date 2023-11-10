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
	conditions = ""
	colums = ""
	order_by = ""
	columns = []
	group_by = "group by"
	maquina = ""
	
	#from_date, to_date = getdate(filters.from_date), (getdate(filters.to_date) + timedelta(days=1))
	from_date, to_date = getdate(filters.from_date), (getdate(filters.to_date))
	
	#columns.append({"label": _("Tiempos"),"fieldname": "timesheet","fieldtype": "Link","options": "Timesheet","width": 100})

	if filters.get("group_by_workstation") or filters.get("workstation"):
		colums += " ws.cod as cod, ti.workstation as workstation,"
		columns.append({"label": _("n"),"fieldname": "cod",	"fieldtype": "Data","width": 40	})
		columns.append({"label": _("Máquina"),"fieldname": "workstation","fieldtype": "Link","options":"Workstation","width": 170})
		if filters.get("group_by_workstation"):
			group_by += ", ti.workstation "
		if filters.get("workstation"):
			conditions += " and ti.workstation = %s " % (frappe.db.escape(filters.get("workstation")))

	#Si se agrupa por empleado o se realiza una búsqueda por empleado
	if filters.get("group_by_employee") or filters.get("employee"):
		colums += " op.employee as cod_emp, op.employee_name as empleado, "
		columns.append({"label": _("Cod Emp"),"fieldname": "cod_emp","fieldtype": "Link","options":"Employee","width": 100})
		columns.append({"label": _("Empleado"),"fieldname": "empleado","fieldtype": "Data","width": 150})
		columns.append({"label": _("Tiempo (minutos)"),"fieldname": "tiempo","fieldtype": "Data","width": 150})
		if filters.get("employee"):
			where +=" and op.employee = %s " % (frappe.db.escape(filters.get("employee")))
		if filters.get("group_by_employee"):
			group_by += ", op.employee"

	if filters.get("group_by_date"):
		colums += " ti.end_date as fecha, "
		columns.append({"label": _("Fecha"),"fieldname": "fecha","fieldtype": "Date","width": 100})
		group_by += ", ti.end_date "

	if group_by <> "group by":
		group_by = group_by.replace("group by, ", "group by ")
	else:
		group_by = ""

	#ordenamos por los mismos criterios de agrupación
	order_by = group_by.replace("group by", "order by")

	conditions += " and (ti.start_date between %s and %s) " % (frappe.db.escape(from_date, percent=False), frappe.db.escape(to_date, percent=False))

	#inner join `tabOperarios` op on op.parent = ti.name
	#op.employee as employee, op.employee_name as employee_name, op.time_in_mins as time_in_mins

	sql = """ select %(colums)s
		sum(op.time_in_mins) as tiempo
		from `tabTimesheet` ti
		inner join `tabOperarios` op on op.parent = ti.name
		inner join `tabWorkstation` ws on ws.name = ti.workstation
		where  ti.docstatus=1 %(conditions)s
		%(group_by)s 
		%(order_by)s """  % {
			"colums": colums, 
			"conditions": conditions,
			"group_by": group_by, 
			"order_by": order_by 
		}

	colums += """ g.* """

	frappe.log_error("{0}".format(sql))
	l_tiempos = frappe.db.sql(sql, as_dict=1, debug=False)
	#l_tiempos_detallado = frappe.db.sql(sql, as_dict=1)


	return l_tiempos, columns