frappe.listview_settings['BOM']['refresh'] =
	function(me) {
		// Filtros
		me.page.add_sidebar_label(__("---------------------"));
		
		me.page.add_sidebar_item(__("FILTRAR POR OPERACIÓN"), function() {
			var publish_filter = me.filter_list.get_filter("operations.operation");
			publish_filter && publish_filter.remove(true);
			//Doctype, fieldname, condition, value, hidden
			me.filter_list.add_filter("BOM Operation", "operation", '=', "");
			me.run();
		});

		me.page.add_sidebar_item(__("FILTRAR POR MATERIAL"), function() {
			var publish_filter = me.filter_list.get_filter("items.item_code");
			publish_filter && publish_filter.remove(true);
			//Doctype, fieldname, condition, value, hidden
			me.filter_list.add_filter("BOM Item", "item_code", '=', "");
			me.run();
		});

		me.page.add_sidebar_label(__("---------------------"));

		
	}