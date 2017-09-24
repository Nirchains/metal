//cur_frm.set_df_property("holiday_list", "hidden", true);

frappe.ui.form.on('Workstation', {
	vel_min: function (frm) {
		frm.doc.time_in_mins = flt(1/frm.doc.vel_min);
		frm.refresh_fields();
	}
});
