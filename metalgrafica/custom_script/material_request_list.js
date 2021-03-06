frappe.listview_settings['Material Request'] = {
	add_fields: ["material_request_type", "status", "per_ordered"],
	get_indicator: function(doc) {
		if(doc.status=="Stopped") {
			return [__("Stopped"), "red", "status,=,Stopped"];
		} else if(doc.docstatus==1 && flt(doc.per_ordered, 2) == 0) {
			return [__("Pending"), "orange", "per_ordered,=,0"];
		}  else if(doc.docstatus==1 && flt(doc.per_ordered, 2) < 100) {
			return [__("Partially ordered"), "yellow", "per_ordered,<,100"];
		} else if(doc.docstatus==1 && flt(doc.per_ordered, 2) == 100) {
			if (doc.material_request_type == "Purchase") {
				return [__("Ordered"), "green", "per_ordered,=,100"];
			} else if (doc.material_request_type == "Material Transfer") {
				return [__("Transfered"), "green", "per_ordered,=,100"];
			} else if (doc.material_request_type == "Material Issue") {
				return [__("Issued"), "green", "per_ordered,=,100"];
			}
		}
	},
	onload: function(list_view) {
		let method = "metalgrafica.util.cancel_documents"

		list_view.page.add_menu_item(__("Cancelar solicitudes"), function() {
			list_view.call_for_selected_items(method, { doctype: "Material Request" });
		});
		
	},
	refresh: function(me) {
		// Filtros
		me.page.add_sidebar_label(__('----------'));
		me.page.add_sidebar_label(__('Filtros:'));
        me.page.add_sidebar_item(__('Buscar por producto'), function() {
			var publish_filter = me.filter_list.get_filter("items.item_code");
			publish_filter && publish_filter.remove(true);
			//Doctype, fieldname, condition, value, hidden
			me.filter_list.add_filter("Material Request Item", "item_code", '=', "");
			me.run();
		});
        
	
	}
};
