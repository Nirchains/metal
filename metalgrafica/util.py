import frappe

from frappe import _
import json
from erpnext.controllers.queries import get_match_cond
from ast import literal_eval
from frappe.utils import (cstr, flt, cint, getdate, now_datetime, formatdate,
	strip, get_timestamp, random_string)

def get_help_messages():
	'''Returns help messages to be shown on Desktop'''
	messages = []

	return messages

def product_bundle_validate():
	pass

@frappe.whitelist()
def get_timesheet_events(start, end, filters=None):
	"""Returns events for Gantt / Calendar view rendering.
	:param start: Start date-time.
	:param end: End date-time.
	:param filters: Filters (JSON).
	"""
	filters = json.loads(filters)
	from frappe.desk.calendar import get_event_conditions
	conditions = get_event_conditions("Timesheet", filters)

	return frappe.db.sql("""select `tabTimesheet Detail`.name as name,
			`tabTimesheet Detail`.docstatus as status, `tabTimesheet Detail`.parent as parent,
			from_time as start_date, hours, activity_type,
			`tabTimesheet Detail`.project, to_time as end_date,
			CONCAT(`tabTimesheet Detail`.parent, ' (', ROUND(hours,2),' hrs)', ' - ', workstation) as title
		from `tabTimesheet Detail`, `tabTimesheet`
		where `tabTimesheet Detail`.parent = `tabTimesheet`.name
			and `tabTimesheet`.docstatus < 2
			and (from_time <= %(end)s and to_time >= %(start)s) {conditions} {match_cond}
		""".format(conditions=conditions, match_cond = get_match_cond('Timesheet')),
		{
			"start": start,
			"end": end
		}, as_dict=True, update={"allDay": 0})


def get_stock_entry_materials(production_order):

	return frappe.db.sql("""select * 
		from `tabStock Entry`
		where  `tabStock Entry`.production_order = %s
		""", production_order, as_dict=True)


@frappe.whitelist()
def create_batch_secuence(inicio_de_secuencia, producto, numero_bloques):
	filas = []
	inicio = int(inicio_de_secuencia)
	for x in xrange(int(numero_bloques)):
		doc = frappe.get_doc({"doctype": "Batch", "batch_id":  str(inicio),"item": producto, "automatic": 1 })
		doc.insert()
		filas.extend([{"id": inicio }])
		inicio += 1
	return filas

def clean_batch():
	'''Limpia los lotes que no estan asociados en ninguna recepcion de compra'''
	frappe.db.sql("""delete from tabBatch where automatic = 1 and 
		name not in (select batch_no from `tabPurchase Receipt Item`)""")

@frappe.whitelist()
def get_next_batch():
	'''Devuelve el siguiente numero de lote disponible'''
	return frappe.db.sql("""select max(name)+1 from tabBatch where automatic = 1""")

@frappe.whitelist()
def get_prueba_filas():
	filas = []
	filas.extend([{"id": 100, "name": "asdf"}, {"id": 101, "name": "asdff"}])
	return filas


def cleanup(fname):
    if os.path.exists(fname):
        os.remove(fname)