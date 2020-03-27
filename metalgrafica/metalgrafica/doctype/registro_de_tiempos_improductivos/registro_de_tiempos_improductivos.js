// Copyright (c) 2020, Pedro Antonio Fernández Gómez and contributors
// For license information, please see license.txt
cur_frm.add_fetch("employee", "employee_name", "employee_name");
cur_frm.add_fetch("workstation", "cod", "cod");


frappe.ui.form.on('Registro de Tiempos Improductivos', {
	// refresh: function(frm) {

	// }
});


cur_frm.add_fetch("activity_cod", "activity_type", "activity_name");

cur_frm.set_query("activity_cod", "time_details", function(doc, cdt, cdn) {
	var d = locals[cdt][cdn];
	return {
		filters: {
			workstation: d.workstation
		}
	};
});