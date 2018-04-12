import frappe

from frappe import _
import json
import barcode
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
def get_prueba_filas():
	filas = []
	filas.extend([{"id": 100, "name": "asdf"}, {"id": 101, "name": "asdff"}])
	return filas


@frappe.whitelist(allow_guest=True)
def barcode_gen(b_type,b_string):
    from barcode.writer import ImageWriter
    ean = barcode.get(b_type, b_string)
    filename = ean.save(b_string)
    filedata = ""
    with open(filename, "rb") as fileobj:
        filedata = fileobj.read()
    frappe.local.response.filename = filename
    frappe.local.response.filecontent = filedata
    frappe.local.response.type = "download"
    cleanup(filename)
    return ean

def cleanup(fname):
    if os.path.exists(fname):
        os.remove(fname)