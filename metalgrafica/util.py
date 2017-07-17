import frappe

from frappe import _

def item_autoname(doc, method):
	if frappe.db.get_default("item_naming_by")=="Naming Series":
		if doc.variant_of:
			if not doc.item_code:
				doc.item_code = make_variant_item_code(doc.variant_of, doc)
		else:
			from frappe.model.naming import make_autoname
			doc.item_code = make_autoname(doc.naming_series+'.#####')
	elif not doc.item_code:
		msgprint(_("Item Code is mandatory because Item is not automatically numbered"), raise_exception=1)

	doc.item_code = make_autoname("asdf"+'.#####')
	doc.name = make_autoname("asdf"+'.#####')
	doc.item_name = make_autoname("asdf"+'.#####')


def get_help_messages():
	'''Returns help messages to be shown on Desktop'''
	messages = []

	return messages

@frappe.whitelist()
def get_prueba_filas():
	filas = []
	filas.extend([{"id": 100, "name": "asdf"}, {"id": 101, "name": "asdff"}])
	return filas
