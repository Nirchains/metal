// Copyright (c) 2020, Pedro Antonio Fernández Gómez and contributors
// For license information, please see license.txt
cur_frm.add_fetch("employee", "employee_name", "employee_name");

frappe.ui.form.on('Registro de Tiempos Indirectos', {
	// refresh: function(frm) {

	// }
});

cur_frm.add_fetch("activity_cod", "activity_type", "activity_name");
