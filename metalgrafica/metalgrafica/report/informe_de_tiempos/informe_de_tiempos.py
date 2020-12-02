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
	
	#Si se agrupa por orden de trabajo
	if filters.get("group_by_wo"):
		colums += "orden, "
		columns.append({"label": _("Orden"),"fieldname": "orden","fieldtype": "Link","options": "Work Order","width": 100})
		columns.append({"label": _("Tiempos"),"fieldname": "timesheet","fieldtype": "Link","options": "Timesheet","width": 100})
		group_by += ", orden "

	if filters.get("group_by_date"):
		colums += " fecha, "
		columns.append({"label": _("Fecha"),"fieldname": "fecha","fieldtype": "Date","width": 100})
		group_by += ", fecha "

	#Siempre se agrupa por estación de trabajo
	colums += " cod, turno, workstation, rendimiento_linea, rendimiento_inverso,"
	if filters.get("group_by_turno") or filters.get("turno"):
		columns.append({"label": _("Turno"),"fieldname": "turno",	"fieldtype": "Data","width": 40	})	

	if filters.get("turno"):
		conditions += "and ti.turno = %s " % (frappe.db.escape(filters.get("turno")))

	if filters.get("group_by_turno"):
		group_by += ", turno "

	
	columns.append({"label": _("n"),"fieldname": "cod",	"fieldtype": "Data","width": 40	})
	columns.append({"label": _("Máquina"),"fieldname": "workstation","fieldtype": "Link","options":"Workstation","width": 170})
	columns.append({"label": _("Rdto.Linea"),"fieldname": "rendimiento_linea","fieldtype": "Data","width": 70})
	group_by += ", workstation "

	columns.append({"label": _("Presencial"),"fieldname": "tiempo_presencial","fieldtype": "Int","width": 100})
	columns.append({"label": _("Productivo"),"fieldname": "tiempo_productivo","fieldtype": "Int","width": 80})
	columns.append({"label": _("Improductivo"),"fieldname": "tiempo_improductivo","fieldtype": "Int","width": 80})
	columns.append({"label": _("Fab"),"fieldname": "fabricado","fieldtype": "Int","width": 80})
	columns.append({"label": _("Rdto"),"fieldname": "rendimiento","fieldtype": "Percent","width": 80})
	columns.append({"label": _("Rdto.Total"),"fieldname": "rendimiento_total","fieldtype": "Percent","width": 80})

	#Si se agrupa por empleado o se realiza una búsqueda por empleado
	if filters.get("group_by_employee") or filters.get("employee"):
		columns.append({"label": _("Cod Emp"),"fieldname": "cod_emp","fieldtype": "Link","options":"Employee","width": 100})
		columns.append({"label": _("Empleado"),"fieldname": "empleado","fieldtype": "Data","width": 150})
		columns.append({"label": _("Presencial Emp."),"fieldname": "emp_tiempo_presencial","fieldtype": "Data","width": 150})

	if group_by <> "group by":
		group_by = group_by.replace("group by, ", "group by ")
	else:
		group_by = ""

	#ordenamos por los mismos criterios de agrupación
	order_by = group_by.replace("group by", "order by")

	conditions += " and (ti.start_date between %s and %s) " % (frappe.db.escape(from_date, percent=False), frappe.db.escape(to_date, percent=False))

	if filters.get("workstation"):
		conditions += " and wop.workstation = %s " % (frappe.db.escape(filters.get("workstation")))


	#inner join `tabOperarios` op on op.parent = ti.name
	#op.employee as employee, op.employee_name as employee_name, op.time_in_mins as time_in_mins

	sql = """ select 
		wo.name as orden, wo.produced_qty as fabricado, ti.turno,		
		woi.transferred_qty as fab_inverso,
		wop.workstation as workstation, ws.vel_min as rendimiento_linea, ws.rendimiento_inverso as rendimiento_inverso, ws.cod as cod,
		ti.name as timesheet, ti.start_date as fecha, (ti.activities_time) as tiempo_presencial, (ti.productive_time) as tiempo_productivo, 
		(ti.unproductive_time) as tiempo_improductivo
		from
		`tabWork Order` wo
		inner join `tabWork Order Operation` wop on wop.parent = wo.name
		inner join `tabWork Order Item` woi on woi.parent = wo.name and woi.idx = 1
		inner join `tabOperation` wopdetail on wopdetail.name = wop.operation
		inner join `tabWorkstation` ws on ws.name = wopdetail.workstation
		inner join `tabTimesheet` ti on ti.work_order = wo.name
		where  wo.status='Completed' and ti.docstatus=1 %(conditions)s
		"""  % {
			"colums": colums, 
			"conditions": conditions
		}

	colums += """
				 timesheet, 
				 sum(fab_inverso) as fab_inverso,
				 sum(fabricado) as fabricado,
				 sum(tiempo_presencial) as tiempo_presencial, 
				 sum(tiempo_productivo) as tiempo_productivo, 
				 sum(tiempo_improductivo) as tiempo_improductivo """

	sql_group_by = """ select %(colums)s from (%(sql)s) g
		%(group_by)s 
		%(order_by)s """ % {
			"colums": colums,	"sql": sql,	"group_by": group_by, "order_by": order_by 
		}

	if filters.get("group_by_employee") or filters.get("employee"):
		where = " where 1=1"
		inner_join = ""
		if filters.get("employee"):
			where +=" and op.employee = %s " % (frappe.db.escape(filters.get("employee")))
		if filters.get("group_by_wo"):
			inner_join = """inner join `tabOperarios` op on op.parent = e.timesheet"""
		else:
			inner_join = """inner join `tabOperarios` op on op.parent in ( 
				select  ti.name
				from
				`tabWork Order` wo
				inner join `tabWork Order Operation` wop on wop.parent = wo.name
				inner join `tabOperation` wopdetail on wopdetail.name = wop.operation
				inner join `tabWorkstation` ws on ws.name = wopdetail.workstation
				inner join `tabTimesheet` ti on ti.work_order = wo.name
				where  wo.status='Completed'  and ti.docstatus=1 and ti.start_date = e.fecha and ws.name = e.workstation )
				"""
		

		sql_group_by = """
			select e.*, op.employee as cod_emp, op.employee_name as empleado,
			sum(op.time_in_mins) as emp_tiempo_presencial

			from ({0}) e
			{1}
			{2}
			{3}, op.employee
			""".format(sql_group_by, inner_join, where, group_by)


	#frappe.log_error("{0}".format(sql_group_by))
	l_tiempos = frappe.db.sql(sql_group_by, as_dict=1)
	#l_tiempos_detallado = frappe.db.sql(sql, as_dict=1)

	for registro in l_tiempos:
		try:
			if filters.get("group_by_employee") or filters.get("employee"):
				registro["tiempo_presencial"] = registro["emp_tiempo_presencial"]
				registro["tiempo_improductivo"] = registro.tiempo_presencial - registro.tiempo_productivo
			if registro.rendimiento_inverso:
				registro.fabricado = registro.fab_inverso
			#registro["tiempo_improductivo"] = int(registro.tiempo_presencial) - int(registro.tiempo_productivo)
			#registro["tiempo_improductivo"] = 0
			#for tiempo in l_tiempos_detallado:
			#	if (tiempo.orden == registro.orden):
			#		registro["tiempo_improductivo"] += tiempo.time_in_mins

			if registro.fabricado > 0 and registro.tiempo_productivo > 0 and registro.rendimiento_linea > 0:
				registro["rendimiento"] = (registro.fabricado/(registro.tiempo_productivo*registro.rendimiento_linea))*100
				registro["rendimiento_total"] = (registro.fabricado/(registro.tiempo_presencial*registro.rendimiento_linea))*100
			registro["rendimiento_linea"] = "{0}/min".format(int(registro.rendimiento_linea))
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