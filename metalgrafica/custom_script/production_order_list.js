frappe.listview_settings['Production Order']['refresh'] =
	function(me) {
		// Filtros
		me.page.add_sidebar_label(__("---------------------"));
		me.page.add_sidebar_item(__("FILTRAR POR OPERACIÓN"), function() {
			var publish_filter = me.filter_list.get_filter("operations.operation");
			publish_filter && publish_filter.remove(true);
			//Doctype, fieldname, condition, value, hidden
			me.filter_list.add_filter("Production Order Operation", "operation", '=', "");
			me.run();
		});

		me.page.add_sidebar_label(__("---------------------"));

		me.page.add_sidebar_label(__("BOM:"));

		me.page.add_sidebar_item(__("PRODUCTO"), function() {
			var publish_filter = me.filter_list.get_filter("production_item");
			publish_filter && publish_filter.remove(true);
			//Doctype, fieldname, condition, value, hidden
			me.filter_list.add_filter(me.doctype, "production_item", 'like', "LATA-");
			me.run();
		});

		me.page.add_sidebar_item(__("-CUERPO"), function() {
			var publish_filter = me.filter_list.get_filter("production_item");
			publish_filter && publish_filter.remove(true);
			//Doctype, fieldname, condition, value, hidden
			me.filter_list.add_filter(me.doctype, "production_item", 'like', "CUERPO-");
			me.run();
		});

		me.page.add_sidebar_item(__("--TAPA SIN TERMINAR"), function() {
			var publish_filter = me.filter_list.get_filter("production_item");
			publish_filter && publish_filter.remove(true);
			//Doctype, fieldname, condition, value, hidden
			me.filter_list.add_filter(me.doctype, "production_item", 'like', "TAPA-ST-");
			me.run();
		});

 		me.page.add_sidebar_item(__("---TIRA TAPA"), function() {
			var publish_filter = me.filter_list.get_filter("production_item");
			publish_filter && publish_filter.remove(true);
			//Doctype, fieldname, condition, value, hidden
			me.filter_list.add_filter(me.doctype, "production_item", 'like', "TIRA-T-");
			me.run();
		});

		me.page.add_sidebar_item(__("-FONDO"), function() {
			var publish_filter = me.filter_list.get_filter("production_item");
			publish_filter && publish_filter.remove(true);
			//Doctype, fieldname, condition, value, hidden
			me.filter_list.add_filter(me.doctype, "production_item", 'like', "FONDO-");
			me.run();
		});
        me.page.add_sidebar_item(__("--TIRA FONDO"), function() {
			var publish_filter = me.filter_list.get_filter("production_item");
			publish_filter && publish_filter.remove(true);
			//Doctype, fieldname, condition, value, hidden
			me.filter_list.add_filter(me.doctype, "production_item", 'like', "TIRA-F-");
			me.run();
		});
	}