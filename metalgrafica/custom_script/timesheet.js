frappe.ui.form.on('Timesheet', {
	refresh: function(frm) {
		if(!frm.doc.__islocal) {
			if (frm.doc.production_order) {
				frm.add_custom_button(__("Ver orden de producción"),
					function() {
						frappe.set_route("Form", "Production Order", frm.doc.production_order);
					}
				);
			}		
		}
	},
	onload: function(frm) {
		if (frm.doc.status != "Submitted") {
			var timesheet_detail = frm.doc.time_logs;
			$.each(timesheet_detail, function(i, item){
				if (!helper.IsNullOrEmpty(item.hours)) {
					frappe.model.set_value(item.doctype, item.name, 'minutos', (item.hours*60).toString());
				}
			});
		}
		if (frm.doc.__islocal) {
			calculate_employees_times(frm);
			calculate_activities_times(frm);
		}
	}
});

frappe.ui.form.on('Timesheet Detail', {
	minutos: function (frm, cdt, cdn) {
		var d = frappe.get_doc(cdt, cdn);
		d.hours = (flt(d.minutos/60));
		cur_frm.refresh_fields();
		calculate_end_time(frm, cdt, cdn)
	},
	hours: function (frm, cdt, cdn) {
		var d = frappe.get_doc(cdt, cdn);
		d.minutos = flt(d.hours*60);
		cur_frm.refresh_fields();
	}
});

frappe.ui.form.on('Operarios', {
	operarios_remove: function (frm, cdt, cnd) {
		calculate_employees_times(frm);
	},
	time_in_mins: function (frm, cdt, cdn) {
		calculate_employees_times(frm);
	}
});

frappe.ui.form.on('Timesheet Extra', {
	timesheet_extra_remove: function (frm, cdt, cnd) {
		calculate_activities_times(frm);
	},
	time_in_mins: function (frm, cdt, cdn) {
		calculate_activities_times(frm);
	}
});

cur_frm.set_query("employee", "operarios", function(doc, cdt, cdn) {
	var d = locals[cdt][cdn];
	return {
		filters: [
			['Employee', 'status', '=','Active']
		]
	};
});

var calculate_employees_times = function(frm) {
	var tl = frm.doc.operarios || [];
	var total = 0;
	for(var i=0; i<tl.length; i++) {
		if (tl[i].time_in_mins) {
			total += tl[i].time_in_mins;
		}
	}

	frm.set_value("employee_time", total);
}

var calculate_activities_times = function(frm) {
	var tl = frm.doc.timesheet_extra || [];
	var total = 0;
	for(var i=0; i<tl.length; i++) {
		if (tl[i].time_in_mins) {
			total += tl[i].time_in_mins;
		}
	}

	frm.set_value("activities_time", total);
}