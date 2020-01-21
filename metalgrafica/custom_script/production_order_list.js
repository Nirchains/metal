frappe.listview_settings['Work Order'] = {
	add_fields: ["bom_no", "status", "impreso", "sales_order", "qty",
		"produced_qty", "expected_delivery_date", "planned_start_date", "planned_end_date"],
	filters: [["status", "!=", "Stopped"]],
	get_indicator: function(doc) {
		if(doc.status==="Submitted") {
			return [__("Not Started"), "orange", "status,=,Submitted"];
		} else {
			return [__(doc.status), {
				"Draft": "red",
				"Stopped": "red",
				"Not Started": "red",
				"In Process": "orange",
				"Completed": "green",
				"Cancelled": "darkgrey"
			}[doc.status], "status,=," + doc.status];
		}
	}
};


frappe.listview_settings['Work Order']['refresh'] =
	function(me) {
		// Filtros
		me.page.add_sidebar_label(__("---------------------"));
		me.page.add_sidebar_item(__("FILTRAR POR OPERACIÓN"), function() {
			var publish_filter = me.filter_list.get_filter("production_item");
			//Doctype, fieldname, condition, value, hidden
			me.filter_list.add_filter("Work Order Operation", "operation", '=', "");
			me.run();
		});

		me.page.add_sidebar_label(__("---------------------"));

		me.page.add_sidebar_label(__("BOM:"));

		me.page.add_sidebar_item(__("PRODUCTO"), function() {
			me.filter_list.clear_filters_by_name("production_item");
			//Doctype, fieldname, condition, value, hidden
			me.filter_list.add_filter(me.doctype, "production_item", 'like', "LATA-");
			me.run();
		});

		me.page.add_sidebar_item(__("-CUERPO"), function() {
			me.filter_list.clear_filters_by_name("production_item");
			//Doctype, fieldname, condition, value, hidden
			me.filter_list.add_filter(me.doctype, "production_item", 'like', "CUERPO-");
			me.run();
		});
		me.page.add_sidebar_item(__("-TAPA"), function() {
			me.filter_list.clear_filters_by_name("production_item");
			//Doctype, fieldname, condition, value, hidden
			me.filter_list.add_filter(me.doctype, "production_item", 'like', "TAPA-");
			me.filter_list.add_filter(me.doctype, "production_item", 'not like', "TAPA-ST-");
			me.run();
		});
		me.page.add_sidebar_item(__("--TAPA SIN TERMINAR"), function() {
			me.filter_list.clear_filters_by_name("production_item");
			//Doctype, fieldname, condition, value, hidden
			me.filter_list.add_filter(me.doctype, "production_item", 'like', "TAPA-ST-");
			me.run();
		});

 		me.page.add_sidebar_item(__("---TIRA TAPA"), function() {
			me.filter_list.clear_filters_by_name("production_item");
			//Doctype, fieldname, condition, value, hidden
			me.filter_list.add_filter(me.doctype, "production_item", 'like', "TIRA-T-");
			me.run();
		});

		me.page.add_sidebar_item(__("-FONDO"), function() {
			me.filter_list.clear_filters_by_name("production_item");
			//Doctype, fieldname, condition, value, hidden
			me.filter_list.add_filter(me.doctype, "production_item", 'like', "FONDO-");
			me.run();
		});
        me.page.add_sidebar_item(__("--TIRA FONDO"), function() {
			me.filter_list.clear_filters_by_name("production_item");
			//Doctype, fieldname, condition, value, hidden
			me.filter_list.add_filter(me.doctype, "production_item", 'like', "TIRA-F-");
			me.run();
		});
	}