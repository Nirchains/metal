
frappe.listview_settings['Item']['onload'] =
    function(listview) {
		frappe.route_options = {
			'disabled': 0
		};
	}


frappe.listview_settings['Item']['refresh'] =
	function(me) {
		// Filtros
		me.page.add_sidebar_label(__('----------'));
		me.page.add_sidebar_label(__('Filtros:'));
        me.page.add_sidebar_item(__('Productos en escasez'), function() {
			var publish_filter = me.filter_list.get_filter('total_projected_qty');
			publish_filter && publish_filter.remove(true);
			me.filter_list.add_filter(me.doctype, 'total_projected_qty', '<', '0');
			me.run();
		});
        
	}
frappe.help.youtube_id["Item"] = "";