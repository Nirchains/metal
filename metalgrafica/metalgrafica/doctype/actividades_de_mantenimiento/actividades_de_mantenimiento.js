// Copyright (c) 2020, Pedro Antonio Fernández Gómez and contributors
// For license information, please see license.txt

cur_frm.add_fetch("workstation", "cod", "workstation_cod");
cur_frm.add_fetch("activity_workstation_cod", "activity_type", "activity_workstation");

frappe.ui.form.on('Actividades de mantenimiento', {
	onload: function(frm) {
		frm.set_query("activity_workstation_cod", function() {
			return {
				"filters": {
					"type": "General"
				}
			};
		});
	},
	refresh: function(frm) {
		cur_frm.cscript.actividades_de_mantenimiento.check_type(frm);
	},

	type: function(frm) {
		cur_frm.cscript.actividades_de_mantenimiento.check_type(frm);
	},
	workstation: function(frm) {
		cur_frm.cscript.actividades_de_mantenimiento.set_name(frm);
	},
	activity_workstation_cod: function(frm) {
		cur_frm.cscript.actividades_de_mantenimiento.set_name(frm);
	}
});


cur_frm.cscript.actividades_de_mantenimiento = {
	check_type: function(frm) {
		var cond = frm.doc.type!=="Específico";
		//util.toggle_enable_and_required(frm, "cod", cond);
		//util.toggle_enable_and_required(frm, "activity_type", cond);
		frm.toggle_reqd("workstation", !cond);
		frm.toggle_reqd("activity_workstation_cod", !cond);
		frm.toggle_display("sb_especifico",!cond)
	},
	set_name: function(frm) {
		var workstation_cod = frm.doc.workstation_cod || '';
		var activity_workstation_cod = frm.doc.activity_workstation_cod || '';
		var cod = workstation_cod + "" + activity_workstation_cod;
		var activity_workstation = frm.doc.activity_workstation || '';
		var workstation = frm.doc.workstation || '';
		var name = workstation + " " + activity_workstation;
		frm.set_value("cod", cod);
		frm.set_value("activity_type", name);
	}
}