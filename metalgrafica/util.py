import frappe

from frappe import _

def get_help_messages():
	'''Returns help messages to be shown on Desktop'''
	messages = []

	return messages

@frappe.whitelist()
def get_prueba_filas():
	filas = []
	filas.extend([{"id": 100, "name": "asdf"}, {"id": 101, "name": "asdff"}])
	return filas
