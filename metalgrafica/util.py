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
def item_description_generate():
	args = frappe.form_dict
	doc = literal_eval(args.doc)
	descripciones = []
	doc["description"] = ""

	append_description_if_no_null(doc, descripciones, "TIPO", None, frappe.db.get_value("Item Group", doc["item_group"], "abreviatura"))
	append_description_if_no_null(doc, descripciones, "FORMATO", "formato")
	append_description_if_no_null(doc, descripciones, "MARCA", "brand")

	append_description_if_no_null(doc, descripciones, "ACABADO", "acabado")
	append_description_if_no_null(doc, descripciones, "DIAMETRO", "diametro")
	append_description_if_no_null(doc, descripciones, "LARGO", "largo")
	append_description_if_no_null(doc, descripciones, "ANCHO", "ancho")
	append_description_if_no_null(doc, descripciones, "ALTO", "alto")
	append_description_if_no_null(doc, descripciones, "ESPESOR", "espesor")
	append_description_if_no_null(doc, descripciones, "COLOR", "color")
	append_description_if_no_null(doc, descripciones, "POSICION", "posicion")
	append_description_if_no_null(doc, descripciones, "PANELADO", "panelado")
	append_description_if_no_null(doc, descripciones, "PALET", "palet")
	append_description_if_no_null(doc, descripciones, "NUMERO DE CAPAS", "numero_de_capas")
	append_description_if_no_null(doc, descripciones, "NUMERO DE ENVASES POR CAPA", "numero_envases_capa")
		
	doc["description"] = "{0}".format("<br>".join(descripciones))
		
	return doc["description"]

@frappe.whitelist()
def item_name_generate():
	args = frappe.form_dict
	doc = literal_eval(args.doc)
	descripciones = []
	doc["item_name"] = ""

	append_item_code_if_no_null(doc, descripciones, "TIPO", None, frappe.db.get_value("Item Group", doc["item_group"], "abreviatura"))
	append_item_code_if_no_null(doc, descripciones, "FORMATO", "formato")
	append_item_code_if_no_null(doc, descripciones, "MARCA", "brand")

	append_item_code_if_no_null(doc, descripciones, "ACABADO", "acabado")
	append_item_code_if_no_null(doc, descripciones, "DIAMETRO", "diametro")
	append_item_code_if_no_null(doc, descripciones, "LARGO", "largo")
	append_item_code_if_no_null(doc, descripciones, "ANCHO", "ancho")
	append_item_code_if_no_null(doc, descripciones, "ALTO", "alto")
	append_item_code_if_no_null(doc, descripciones, "ESPESOR", "espesor")
	append_item_code_if_no_null(doc, descripciones, "COLOR", "color")
	append_item_code_if_no_null(doc, descripciones, "POSICION", "posicion")
	append_item_code_if_no_null(doc, descripciones, "PANELADO", "panelado")
	append_item_code_if_no_null(doc, descripciones, "PALET", "palet")
	append_item_code_if_no_null(doc, descripciones, "NUMERO DE CAPAS", "numero_de_capas")
	append_item_code_if_no_null(doc, descripciones, "NUMERO DE ENVASES POR CAPA", "numero_envases_capa")
		
	doc["item_name"] = "{0}".format("-".join(descripciones))
		
	return doc["item_name"]

@frappe.whitelist()
def cargar_materiales_desde_plantilla(item_group):
	materiales = frappe.get_list("BOM Item Plantilla", 
								filters={'parent': item_group,
										'parenttype': 'Plantilla de grupo de productos',
										'parentfield': 'materiales' },
								fields="*")
	return materiales

@frappe.whitelist()
def cargar_materiales_desde_producto(item):
	materiales = frappe.get_list("BOM Item", 
								filters={'parent': item,
										'parenttype': 'Item',
										'parentfield': 'materiales' },
								fields="*")
	return materiales


@frappe.whitelist()
def get_prueba_filas():
	filas = []
	filas.extend([{"id": 100, "name": "asdf"}, {"id": 101, "name": "asdff"}])
	return filas

def append_description_if_no_null(doc, arr, label, key=None, value=None):
	if key in doc.keys():
		if doc[key]:
			arr.append("<b>{0}</b>: {1}".format(label, doc[key]))

	if value:
		arr.append("<b>{0}</b>: {1}".format(label, value))

def append_item_code_if_no_null(doc, arr, label, key=None, value=None):
	if key in doc.keys():
		if doc[key]:
			arr.append("{0}".format(doc[key]))

	if value:
		arr.append("{0}".format(value))
