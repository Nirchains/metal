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
	conditions_timesheet = " "
	conditions_fabricado = " "
	joins_time_sheet = " "
	colums = ""
	column_sql_t_presencial = ""
	order_by = ""
	columns = []
	group_by = "group by"
	maquina = ""
	
	from_date, to_date = getdate(filters.from_date), (getdate(filters.to_date) + timedelta(days=1))
	
	if filters.get("group_by_wo"):
		colums += "wo.name as orden, "
		columns.append({"label": _("Orden"),"fieldname": "orden","fieldtype": "Link","options": "Work Order","width": 100})
		group_by += ", wo.name"
		conditions_timesheet += " and tim.work_order = wo.name "
		conditions_fabricado += " and wof.name = wo.name "
		
	if filters.get("group_by_date"):
		colums += " ti.start_date as fecha, "
		columns.append({"label": _("Fecha"),"fieldname": "fecha","fieldtype": "Date","width": 100})
		group_by += ", ti.start_date"
		conditions_timesheet += " and tim.start_date = ti.start_date "

	if filters.get("group_by_ws"):
		colums += " ws.cod as n, ws.name as maquina, "
		columns.append({"label": _("n"),"fieldname": "n",	"fieldtype": "Data","width": 40	})
		columns.append({"label": _("Máquina"),"fieldname": "maquina","fieldtype": "Link","options":"Workstation","width": 170})
		columns.append({"label": _("Rdto.Linea"),"fieldname": "rendimiento_linea","fieldtype": "Data","width": 70})
		group_by += ", ws.name"
		conditions_timesheet += " and wope.operation = wop.operation "
	
	joins_time_sheet += " inner join `tabWork Order` woe on woe.name = tim.work_order inner join `tabWork Order Operation` wope on wope.parent = woe.name "

	if filters.get("group_by_employee") or filters.get("employee"):
		colums+= " op.employee as cod_emp, op.employee_name as empleado, "
		columns.append({"label": _("Cod Emp"),"fieldname": "cod_emp","fieldtype": "Link","options":"Employee","width": 70})
		columns.append({"label": _("Empleado"),"fieldname": "empleado","fieldtype": "Data","width": 150})
		group_by += ", op.employee "
		conditions_timesheet += " and ope.employee = op.employee "
		joins_time_sheet += " inner join `tabOperarios` ope on ope.parent = tim.name"
		column_sql_t_presencial = "ope.time_in_mins"
	else:
		column_sql_t_presencial = "tim.activities_time"

	columns.append({"label": _("Presencial"),"fieldname": "tiempo_presencial","fieldtype": "Int","width": 100})
	columns.append({"label": _("Productivo"),"fieldname": "tiempo_productivo","fieldtype": "Int","width": 80})
	columns.append({"label": _("Improductivo"),"fieldname": "tiempo_improductivo","fieldtype": "Int","width": 80})
	columns.append({"label": _("Fab"),"fieldname": "fabricado","fieldtype": "Int","width": 80})
	columns.append({"label": _("Rdto"),"fieldname": "rendimiento","fieldtype": "Percent","width": 80})
	columns.append({"label": _("Rdto.Total"),"fieldname": "rendimiento_total","fieldtype": "Percent","width": 80})

	if group_by <> "group by":
		group_by = group_by.replace("group by, ", "group by ")
	else:
		group_by = ""

	order_by = group_by.replace("group by", "order by")

	conditions += 			" and (wo.actual_start_date between %s and %s) " % (frappe.db.escape(from_date, percent=False), frappe.db.escape(to_date, percent=False))
	conditions_timesheet += " and woe.status='Completed' and (tim.start_date between %s and %s) " % (frappe.db.escape(from_date, percent=False), frappe.db.escape(to_date, percent=False))

	if filters.get("employee"):
		conditions += " and op.employee = %s " % (frappe.db.escape(filters.get("employee")))

	sql_t_presencial = """(select sum(%s) from `tabTimesheet` tim %s where 1=1 %s)
	""" % (column_sql_t_presencial, joins_time_sheet, conditions_timesheet)

	joins_time_sheet = "inner join `tabTimesheet` tim on tim.name = tie.parent %s" % joins_time_sheet

	sql_t_productivos = """(select sum(tie.time_in_mins) from `tabTimesheet Extra` tie %s where tie.activity_type='PRODUCCIÓN' %s)
	""" % (joins_time_sheet, conditions_timesheet)


	conditions_fabricado +=	" and (wof.actual_start_date between %s and %s) " % (frappe.db.escape(from_date, percent=False), frappe.db.escape(to_date, percent=False))
	sql_fabricado = """ (select sum(produced_qty) from `tabWork Order` wof  
		inner join  `tabWork Order Operation` wopf on wopf.parent = wof.name 
		where wopf.operation = wop.operation
		%s  ) """ % (conditions_fabricado)

	sql = """ select %(colums)s
		%(sql_t_presencial)s as tiempo_presencial,
		%(sql_t_productivos)s as tiempo_productivo,
		%(sql_fabricado)s as fabricado, 
		ws.vel_min as vel_min,
		ws.rendimiento_inverso as rendimiento_inverso,
		woi.transferred_qty as fab_inverso
		from
		`tabWork Order` wo
		inner join `tabWork Order Operation` wop on wop.parent = wo.name
		inner join `tabOperation` wopdetail on wopdetail.name = wop.operation
		inner join `tabWorkstation` ws on ws.name = wopdetail.workstation
		inner join `tabTimesheet` ti on ti.work_order = wo.name
		inner join `tabOperarios` op on op.parent = ti.name
		inner join `tabWork Order Item` woi on woi.parent = wo.name
		inner join `tabRegistro de Tiempos Improductivos` rti on ti.start_date = rti.date
		where  wo.status='Completed' %(conditions)s
		%(group_by)s
		%(order_by)s """  % {
			"colums": colums, 
			"sql_t_presencial": sql_t_presencial,
			"sql_t_productivos": sql_t_productivos,
			"sql_fabricado": sql_fabricado,
			"conditions": conditions, 
			"group_by": group_by, 
			"order_by": order_by 
		}

	frappe.log_error("{0}".format(sql))
	l_tiempos = frappe.db.sql(sql, as_dict=1)

	for registro in l_tiempos:
		try:		
			if registro.rendimiento_inverso:
				registro.fabricado = registro.fab_inverso
			registro["tiempo_improductivo"] = int(registro.tiempo_presencial) - int(registro.tiempo_productivo)
			registro["rendimiento_linea"] = "{0}/min".format(int(registro.vel_min))
			registro["rendimiento"] = (registro.fabricado/(registro.tiempo_productivo*registro.vel_min))*100
			registro["rendimiento_total"] = (registro.fabricado/(registro.tiempo_presencial*registro.vel_min))*100
		except:
			registro["rendimiento"] = 0
			registro["rendimiento_total"] = 0

		"""if filters.get("group_by_employee") and filters.get("group_by_ws"):
				if maquina <> registro.maquina:
					maquina = registro.maquina
				else:
					registro.maquina = ""
					registro.fabricado = 0
					registro.tiempo_productivo = 0
					registro.tiempo_improductivo = 0
					registro["rendimiento_linea"] = 0
					registro["rendimiento"] = 0
					registro["rendimiento_total"] = 0
					"""

	return l_tiempos, columns