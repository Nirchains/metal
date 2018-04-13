import frappe
import barcode
from frappe import _
import json
from erpnext.controllers.queries import get_match_cond
from ast import literal_eval
from frappe.utils import (cstr, flt, cint, getdate, now_datetime, formatdate,
    strip, get_timestamp, random_string)

@frappe.whitelist(allow_guest=True)
def barcode_gen(b_type,b_string):
    
    ean = barcode.get(b_type, b_string)
    filename = ean.save(b_string)
    filedata = ""
    with open(filename, "rb") as fileobj:
        filedata = fileobj.read()
    frappe.local.response.filename = filename
    frappe.local.response.filecontent = filedata
    frappe.local.response.type = "download"
    cleanup(filename)
    ean = "asdf"
    return ean