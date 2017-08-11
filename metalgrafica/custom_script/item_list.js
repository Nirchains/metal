/*
frappe.listview_settings['Item']['onload'] =
    function(listview) {
		frappe.route_options = {
			"has_variants": "No"
		};
	}


frappe.listview_settings['Item']['refresh'] =
	function(me) {
		// Filtros
		me.page.add_sidebar_label(__("Filtros:"));
        me.page.add_sidebar_item(__("Plantillas"), function() {
			var publish_filter = me.filter_list.get_filter("has_variants");
			publish_filter && publish_filter.remove(true);
			me.filter_list.add_filter(me.doctype, "has_variants", '=', "Yes");
			me.run();
		});
        me.page.add_sidebar_item(__("Productos"), function() {
			var publish_filter = me.filter_list.get_filter("has_variants");
			publish_filter && publish_filter.remove(true);
			me.filter_list.add_filter(me.doctype, "has_variants", '=', "No");
			me.run();
		});
	}
*/