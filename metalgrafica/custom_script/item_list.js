
frappe.listview_settings['Item'] = {
	onload: function(listview) {
		frappe.breadcrumbs.add("Metalgrafica", "Item");
		frappe.route_options = {
			'disabled': 0
		};
	}
};


frappe.help.youtube_id["Item"] = "KgME2lrwR0Q";