// Copyright (c) 2016, Pedro Antonio Fernández Gómez and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Informe de tiempos"] = {
	"filters": [
		{
			fieldname: "company",
			label: __("Company"),
			fieldtype: "Link",
			options: "Company",
			default: frappe.defaults.get_user_default("Company"),
			reqd: 1
		},
		{
			fieldname: "from_date",
			label: __("From Date"),
			fieldtype: "Date",
			default: frappe.datetime.get_today(),
			reqd: 1
		},
		{
			fieldname:"to_date",
			label: __("To Date"),
			fieldtype: "Date",
			default: frappe.datetime.get_today(),
			reqd: 1
		},
		{
			fieldname: "employee",
			label: __("Employee"),
			fieldtype: "Link",
			options: "Employee"
		},
		{
			fieldname: "group_by_wo",
			label: __("Agrupar por orden de trabajo"),
			fieldtype: "Check",
			default: 0
		},
		{
			fieldname: "group_by_date",
			label: __("Agrupar por fecha"),
			fieldtype: "Check",
			default: 1
		},
		{
			fieldname: "group_by_ws",
			label: __("Agrupar por linea"),
			fieldtype: "Check",
			default: 1
		},
		{
			fieldname: "group_by_employee",
			label: __("Agrupar por empleado"),
			fieldtype: "Check",
			default: 1
		}
	]
};
