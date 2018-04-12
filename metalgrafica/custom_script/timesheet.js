frappe.ui.form.on('Timesheet', {
	onload: function(frm) {
		if (frm.doc.status != "Submitted") {
			var timesheet_detail = frm.doc.time_logs;
			$.each(timesheet_detail, function(i, item){
				if (!helper.IsNullOrEmpty(item.hours)) {
					frappe.model.set_value(item.doctype, item.name, 'minutos', item.hours*60);
				}
			});
		}
	}
});

frappe.ui.form.on('Timesheet Detail', {
	minutos: function (frm, cdt, cdn) {
		var d = frappe.get_doc(cdt, cdn);
		d.hours = flt(d.minutos/60);
		cur_frm.refresh_fields();
		calculate_end_time(frm, cdt, cdn)
	},
	hours: function (frm, cdt, cdn) {
		var d = frappe.get_doc(cdt, cdn);
		d.minutos = flt(d.hours*60);
		cur_frm.refresh_fields();
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
