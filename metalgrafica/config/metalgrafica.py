from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("Manufactura"),
			"icon": "fa fa-star",
			"items": [
				{
					"type": "doctype",
					"name": "Production Order",
					"description": _("Orders released for production."),
				}
			]
		},
		{
			"label": _("Herramientas de manufactura"),
			"icon": "fa fa-wrench",
			"items": [
				{
					"type": "doctype",
					"name": "Planificar Produccion",
					"description": _("Generate Material Requests (MRP) and Production Orders."),
				},
				{
					"type": "doctype",
					"name": "BOM Update Tool",
					"description": _("Replace BOM and update latest price in all BOMs"),
				},
			]
		},
		{
			"label": _("Productos"),
			"items": [
				{
					"type": "doctype",
					"name": "Item",
					"description": _("All Products or Services."),
				},
				{
					"type": "doctype",
					"name": "BOM",
					"description": _("Bill of Materials (BOM)"),
					"label": _("Bill of Materials")
				},
				{
					"type": "doctype",
					"name": "BOM",
					"icon": "fa fa-sitemap",
					"label": _("BOM Browser"),
					"description": _("Tree of Bill of Materials"),
					"link": "Tree/BOM",
				}
			]
		},
		{
			"label": _("Almac&eacute;n"),
			"icon": "fa fa-table",
			"items": [
				{
					"type": "doctype",
					"name": "Material Request",
					"description": _("Requests for items."),
				},
				{
					"type": "doctype",
					"name": "Stock Entry",
				},
				{
					"type": "doctype",
					"name": "Purchase Receipt",
					"description": _("Goods received from Suppliers."),
				},
				{
					"type": "doctype",
					"name": "Batch",
					"description": _("Batch (lot) of an Item."),
					"label": _("Lotes")
				},
				{
					"type": "page",
					"name": "analisis-de-existenc",
					"label": _("Stock Analytics"),
					"icon": "fa fa-bar-chart"
				},
				{
					"type": "page",
					"name": "stock-balance-1",
					"label": _("Stock Summary")
				}

			]
		},
		{
			"label": _("Configuraci&oacute;n de productos"),
			"items": [
				{
					"type": "doctype",
					"name": "Planos de litografia",
					"description": _("Planos de litografia."),
					"label": _("Planos de litograf&iacute;a")
				},
				{
					"type": "doctype",
					"name": "Tipos de formato",
					"description": _("Tipos de formato."),
					"label": _("Tipos de formato (rectangular, cil&iacute;ndrico)")
				},
				{
					"type": "doctype",
					"name": "Formato",
					"description": _("Formatos."),
					"label": _("Formatos")
				},
				{
					"type": "doctype",
					"name": "Formato denominaciones",
					"description": _("Formatos."),
					"label": _("Formato (nombres)")
				},
				{
					"type": "doctype",
					"name": "Brand",
					"description": _("Marcas."),
					"label": _("Marcas de productos")
				},
				{
					"type": "doctype",
					"name": "Acabado",
					"description": _("Acabados."),
					"label": _("Acabados de productos")
				},
				{
					"type": "doctype",
					"name": "Color",
					"description": _("Colores."),
					"label": _("Colores")
				}

			]
		},

		{
			"label": _("Configuraci&oacute;n de manufactura"),
			"items": [
				{
					"type": "doctype",
					"name": "Manufacturing Settings",
					"description": _("Global settings for all manufacturing processes."),
				},
				{
					"type": "doctype",
					"name": "Plantilla de grupo de productos",
					"description": _("Plantilla de grupo de productos."),
					"label": _("Plantilla de listas de materiales por categor&iacute;a de producto")
				},
				{
					"type": "doctype",
					"name": "Workstation",
					"description": _("Where manufacturing operations are carried."),
					"label": _("Puestos de trabajo")
				},
				{
					"type": "doctype",
					"name": "Operation",
					"description": _("Details of the operations carried out."),
					"label": _("Operaciones")
				},
			]
		},
		{
			"label": _("Tablas maestras de clientes, proveedores, y empleados"),
			"items": [
				{
					"type": "doctype",
					"name": "Customer",
					"description": _("Customer database."),
				},
				{
					"type": "doctype",
					"name": "Supplier",
					"description": _("Supplier database."),
				},
				{
					"type": "doctype",
					"name": "Employee",
					"description": _("Employee records."),
				},
				{
					"type": "doctype",
					"label": _("Customer Group"),
					"name": "Customer Group",
					"icon": "fa fa-sitemap",
					"link": "Tree/Customer Group",
					"description": _("Manage Customer Group Tree."),
				},
				{
					"type": "doctype",
					"name": "Contact",
					"description": _("All Contacts."),
				},
				{
					"type": "doctype",
					"name": "Address",
					"description": _("All Addresses."),
				},

			]
		},
		{
			"label": _("Buying"),
			"icon": "fa fa-star",
			"items": [
				{
					"type": "doctype",
					"name": "Material Request",
					"description": _("Request for purchase."),
				},
				{
					"type": "doctype",
					"name": "Purchase Order",
					"description": _("Purchase Orders given to Suppliers."),
				},
				{
					"type": "doctype",
					"name": "Supplier Quotation",
					"description": _("Quotations received from Suppliers."),
				}				
			]
		},
		{
			"label": _("Sales"),
			"icon": "fa fa-star",
			"items": [
				{
					"type": "doctype",
					"name": "Quotation",
					"description": _("Quotes to Leads or Customers."),
				},
				{
					"type": "doctype",
					"name": "Sales Order",
					"description": _("Confirmed orders from Customers."),
				},
			]
		},

		{
			"label": _("Configuraci&oacute;n de ventas"),
			"items": [
				{
					"type": "doctype",
					"name": "Plazos de entrega",
					"description": _("Plazos de entrega."),
					"label": _("Plazos de entrega")
				},
				{
					"type": "doctype",
					"name": "Portes",
					"description": _("Portes."),
					"label": _("Tipos de portes")
				}
			]
		}
	]
