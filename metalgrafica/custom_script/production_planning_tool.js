frappe.ui.form.on("Production Planning Tool", {
	refresh: function(frm) {
		frm.toggle_display("create_material_requests_non_stock_request", false);
	}

})
