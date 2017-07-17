import frappe

from frappe import _
from ast import literal_eval
from frappe.utils import (cstr, flt, cint, getdate, now_datetime, formatdate,
	strip, get_timestamp, random_string)

def item_autoname(doc, method):
	from frappe.model.naming import make_autoname
	if frappe.db.get_default("item_naming_by")=="Naming Series":
		if doc.variant_of:
			if not doc.item_code:
				doc.item_code = make_variant_item_code(doc.variant_of, doc)
		else:
			from frappe.model.naming import make_autoname
			doc.item_code = make_autoname(doc.naming_series+'.#####')
	elif not doc.item_code:
		msgprint(_("Item Code is mandatory because Item is not automatically numbered"), raise_exception=1)

	doc.item_code = strip(doc.item_code)
	doc.name = doc.item_code


def get_help_messages():
	'''Returns help messages to be shown on Desktop'''
	messages = []

	return messages

@frappe.whitelist()
def item_name_generate():
	args = frappe.form_dict
	doc = literal_eval(args.doc)
	descripciones = []
	doc["description"] = ""

	append_if_no_null(doc, descripciones, "TIPO", None, frappe.db.get_value("Item Group", doc["item_group"], "abreviatura"))
	append_if_no_null(doc, descripciones, "FORMATO", "formato")
	append_if_no_null(doc, descripciones, "MARCA", "brand")

	append_if_no_null(doc, descripciones, "FONDO", "fondo")
	append_if_no_null(doc, descripciones, "TAPA", "tapa")
	append_if_no_null(doc, descripciones, "CUERPO", "cuerpo")
	append_if_no_null(doc, descripciones, "HOJA", "hoja")
	append_if_no_null(doc, descripciones, "TIRA", "tira")
	append_if_no_null(doc, descripciones, "ASA", "asa")
	append_if_no_null(doc, descripciones, "SOPORTE PARA ASA", "soporte_asa")
	append_if_no_null(doc, descripciones, "TAPON", "tapon")

	append_if_no_null(doc, descripciones, "ACABADO", "acabado")
	append_if_no_null(doc, descripciones, "DIAMETRO", "diametro")
	append_if_no_null(doc, descripciones, "LARGO", "largo")
	append_if_no_null(doc, descripciones, "ANCHO", "ancho")
	append_if_no_null(doc, descripciones, "ALTO", "alto")
	append_if_no_null(doc, descripciones, "ESPESOR", "espesor")
	append_if_no_null(doc, descripciones, "COLOR", "color")
	append_if_no_null(doc, descripciones, "POSICION", "posicion")
	append_if_no_null(doc, descripciones, "PANELADO", "panelado")
	append_if_no_null(doc, descripciones, "PALET", "palet")
	append_if_no_null(doc, descripciones, "NUMERO DE CAPAS", "numero_de_capas")
	append_if_no_null(doc, descripciones, "NUMERO DE ENVASES POR CAPA", "numero_envases_capa")
		
	doc["description"] = "{0}".format("<br>".join(descripciones))
		
	return doc["description"]

@frappe.whitelist()
def get_prueba_filas():
	filas = []
	filas.extend([{"id": 100, "name": "asdf"}, {"id": 101, "name": "asdff"}])
	return filas

def append_if_no_null(doc, arr, label, key=None, value=None):
	if key in doc.keys():
		if doc[key]:
			arr.append("<b>{0}</b>: {1}".format(label, doc[key]))

	if value:
		arr.append("<b>{0}</b>: {1}".format(label, value))
