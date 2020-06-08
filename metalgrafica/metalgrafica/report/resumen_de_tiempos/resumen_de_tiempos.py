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
	

	#Siempre se agrupa por estación de trabajo
	colums += " workstation "
	columns.append({"label": _("Máquina"),"fieldname": "workstation","fieldtype": "Link","options":"Workstation","width": 250})
	group_by += ", workstation, activity_cod "

	colums += " , activity_cod, activity_type, activities_time, sum(time_in_mins) as time_in_mins"
	columns.append({"label": _("Código Act."),"fieldname": "activity_cod","fieldtype": "Data","width": 100})
	columns.append({"label": _("Actividad"),"fieldname": "activity_type","fieldtype": "Data","width": 120})
	columns.append({"label": _("Tiempo"),"fieldname": "time_in_mins","fieldtype": "Int","width": 100})
	columns.append({"label": _("Total"),"fieldname": "total","fieldtype": "Percent","width": 80})

	if group_by <> "group by":
		group_by = group_by.replace("group by, ", "group by ")
	else:
		group_by = ""

	#ordenamos por los mismos criterios de agrupación
	order_by = group_by.replace("group by", "order by")

	conditions += 			" and (ti.start_date between %s and %s) " % (frappe.db.escape(from_date, percent=False), frappe.db.escape(to_date, percent=False))

	if filters.get("workstation"):
		conditions += " and ti.workstation = %s " % (frappe.db.escape(filters.get("workstation")))

	sql = """ select 
		ti.workstation as workstation, 
		tie.activity_cod as activity_cod, tie.activity_type as activity_type,
		(ti.activities_time) as activities_time, tie.time_in_mins
		from
		`tabWork Order` wo
		inner join `tabTimesheet` ti on ti.work_order = wo.name
		inner join `tabTimesheet Extra` tie on tie.parenttype='Timesheet' and tie.parent=ti.name
		where  wo.status='Completed' and ti.docstatus=1 %(conditions)s
		"""  % {
			"colums": colums, 
			"conditions": conditions
		}

	sql_group_by = """ select %(colums)s from (%(sql)s) g
		%(group_by)s 
		%(order_by)s """ % {
			"colums": colums,	"sql": sql,	"group_by": group_by, "order_by": order_by 
		}

	#frappe.log_error("{0}".format(sql_group_by))
	l_tiempos = frappe.db.sql(sql_group_by, as_dict=1)

	total = 0
	for registro in l_tiempos:
		total += registro["time_in_mins"]

	frappe.msgprint("{0}".format(total))

	for registro in l_tiempos:
		registro["total"] = (registro["time_in_mins"] / total)*100
	
	return l_tiempos, columns