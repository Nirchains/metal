// Copyright (c) 2016, Pedro Antonio Fernández Gómez and contributors
// For license information, please see license.txt
/* eslint-disable */


frappe.query_reports["Stock de Seguridad"] = {
	"filters": [
		{
			"fieldname":"item_group",
			"label": __("Item Group"),
			"fieldtype": "Link",
			"options": "Item Group",
			"reqd": 1
		},
		{
			"fieldname":"warehouse",
			"label": __("Warehouse"),
			"fieldtype": "Link",
			"options": "Warehouse",
			"default": "Materias primas - MDS"
		},
		{
			"fieldname":"item_code",
			"label": __("Item"),
			"fieldtype": "Link",
			"options": "Item",
			"get_query": function() {
				return {
					query: "erpnext.controllers.queries.item_query"
				}
			}
		}
	]
};
