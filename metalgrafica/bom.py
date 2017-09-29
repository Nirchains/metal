import frappe

from frappe import _
from ast import literal_eval
from frappe.utils import (cstr, flt, cint, getdate, now_datetime, formatdate,
	strip, get_timestamp, random_string)


@frappe.whitelist()
#Genera la descripcion del producto
def item_description_generate():
	args = frappe.form_dict
	doc = literal_eval(args.doc)
	descripciones = []
	doc["description"] = ""

	append_description_if_no_null(doc, descripciones, "TIPO", "item_group")
	append_description_if_no_null(doc, descripciones, "FORMATO", "formato")
	append_description_if_no_null(doc, descripciones, "FORMATO CONTENEDOR", "formato_contenedor")
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
#Genera el codigo del producto
def item_code_generate():
	args = frappe.form_dict
	doc = literal_eval(args.doc)
	descripciones = []
	doc["item_name"] = ""

	append_item_code_if_no_null(doc, descripciones, "TIPO", None, frappe.db.get_value("Item Group", doc["item_group"], "abreviatura"))
	append_item_code_if_no_null(doc, descripciones, "FORMATO", "formato")
	append_item_code_if_no_null(doc, descripciones, "FORMATO CONTENEDOR", "formato_contenedor")
	append_item_code_if_no_null(doc, descripciones, "MARCA", "brand")

	append_item_code_if_no_null(doc, descripciones, "ACABADO", "acabado")
	append_item_code_if_no_null(doc, descripciones, "DIAMETRO", "diametro")
	append_item_code_if_no_null(doc, descripciones, "LARGO", "largo")
	append_item_code_if_no_null(doc, descripciones, "ANCHO", "ancho")
	append_item_code_if_no_null(doc, descripciones, "ALTO", "alto")
	append_item_code_if_no_null(doc, descripciones, "ESPESOR", "espesor")
	append_item_code_if_no_null(doc, descripciones, "COLOR", "color_codigo")
	append_item_code_if_no_null(doc, descripciones, "POSICION", "posicion")
	append_item_code_if_no_null(doc, descripciones, "PANELADO", "panelado")
	append_item_code_if_no_null(doc, descripciones, "PALET", "palet")
	append_item_code_if_no_null(doc, descripciones, "NUMERO DE CAPAS", "numero_de_capas")
	append_item_code_if_no_null(doc, descripciones, "NUMERO DE ENVASES POR CAPA", "numero_envases_capa")
		
	doc["item_name"] = "{0}".format("-".join(descripciones))
		
	return doc["item_name"]

@frappe.whitelist()
#Genera el nombre del producto
def item_name_generate():
	args = frappe.form_dict
	doc = literal_eval(args.doc)
	descripciones = []
	doc["item_name"] = ""

	append_item_code_if_no_null(doc, descripciones, "TIPO", None, frappe.db.get_value("Item Group", doc["item_group"], "abreviatura"))
	append_item_code_if_no_null(doc, descripciones, "FORMATO", "formato")
	append_item_code_if_no_null(doc, descripciones, "FORMATO CONTENEDOR", "formato_contenedor")
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
		
	doc["item_name"] = "{0}".format(" ".join(descripciones))
		
	return doc["item_name"]

@frappe.whitelist()
#Carga la lista de materiales desde la plantilla
def load_bom_materials_from_template(item_group):
	
	materiales = []

	try:
		materiales = frappe.get_list("BOM Item Plantilla", 
								filters={'parent': item_group,
										'parenttype': 'Plantilla de grupo de productos',
										'parentfield': 'materiales' },
								fields="*")
	except Exception as e:
		frappe.msgprint(_("No se ha podido obtener la lista de materiales"))
		raise e
	
	return materiales

@frappe.whitelist()
#Carga la lista de materiales desde la plantilla
def load_qty_from_template(item_group):
	
	qty = 0

	try:
		qty = frappe.get_value("Plantilla de grupo de productos", item_group, 'quantity')
	
	except Exception as e:
		frappe.msgprint(_("No se ha podido obtener la cantidad"))
		raise e
	
	return qty

@frappe.whitelist()
#Carga la lista de materiales desde la plantilla
def load_qty_from_item(item):
	
	qty = 0

	try:
		qty = frappe.get_value("Item", item, 'quantity')
	
	except Exception as e:
		frappe.msgprint(_("No se ha podido obtener la cantidad"))
		raise e
	
	return qty


@frappe.whitelist()
#Carga la lista de materiales desde la plantilla
def item_has_template(item_group):
	if frappe.db.exists("Plantilla de grupo de productos", item_group):
		return True
	else:
		return False
	#try:
	#	qty = frappe.get_value("Plantilla de grupo de productos", item_group, 'quantity')
	#	return True
	#except Exception as e:
	#	return False

	
@frappe.whitelist()
#Carga la lista de materiales desde el producto
def load_bom_materials_from_item(item):
	
	materiales = []

	try:
		materiales = frappe.get_list("BOM Item Producto", 
								filters={'parent': item,
										'parenttype': 'Item',
										'parentfield': 'materiales' },
								fields="*")
	except Exception as e:
		frappe.msgprint(_("No se ha podido obtener la lista de materiales"))
		raise e

	return materiales

@frappe.whitelist()
#Carga la lista de materiales desde el producto
def load_bom_operations_from_item(item):
	
	materiales = []

	try:
		materiales = frappe.get_list("BOM Operation Producto", 
								filters={'parent': item,
										'parenttype': 'Item',
										'parentfield': 'operaciones' },
								fields="*")
	except Exception as e:
		frappe.msgprint(_("No se ha podido obtener la lista de materiales"))
		raise e

	return materiales

@frappe.whitelist()
def validate_uom_is_integer():
	args = frappe.form_dict
	uom = args.uom
	qty = args.qty
	child_dt = args.child_dt

	integer_uom = frappe.db.get_value("UOM", uom, "must_be_whole_number")

	if integer_uom:
		if qty:
			try:
				int(qty)
			except:
				return True
	return False

#Funcion para concatenar la descripcion del producto
def append_description_if_no_null(doc, arr, label, key=None, value=None):
	if key in doc.keys():
		if doc[key]:
			arr.append("<b>{0}</b>: {1}".format(label, doc[key]))

	if value:
		arr.append("<b>{0}</b>: {1}".format(label, value))

#Funcion para concatenar el codigo y nombre del producto
def append_item_code_if_no_null(doc, arr, label, key=None, value=None):
	if key in doc.keys():
		if doc[key]:
			arr.append("{0}".format(doc[key]))

	if value:
		arr.append("{0}".format(value))