from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("Configuracion"),
			"icon": "fa fa-star",
			"items": [
				{
					"type": "doctype",
					"name": "Tipo de factura SII",
					"description": _("Tipos de factura SII"),
				},
				{
					"type": "doctype",
					"name": "Mandatos SEPA",
					"description": _("Mandatos SEPA"),
				}
			]
		}
	]
