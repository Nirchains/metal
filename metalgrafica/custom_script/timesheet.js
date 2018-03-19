frappe.ui.form.on('Timesheet', {
	onload: function(frm) {
		var timesheet_detail = frm.doc.time_logs;
		$.each(timesheet_detail, function(i, item){
			frappe.model.set_value(item.doctype, item.name, 'minutos', item.hours*60);
		});
	}
}),

frappe.ui.form.on('Timesheet Detail', {
	minutos: function (frm, cdt, cdn) {
		var d = frappe.get_doc(cdt, cdn);
		d.hours = flt(d.minutos/60);
		cur_frm.refresh_fields();
	},
	hours: function (frm, cdt, cdn) {
		var d = frappe.get_doc(cdt, cdn);
		d.minutos = flt(d.hours*60);
		cur_frm.refresh_fields();
	}
});
