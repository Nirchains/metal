cur_frm.get_field("supplied_items").grid.toggle_enable("consumed_qty",true);
cur_frm.get_field("supplied_items").grid.toggle_enable("required_qty",true);
cur_frm.refresh_fields();

frappe.ui.form.on("Purchase Receipt", {
	generar_bloques: function(frm) {
		var d;
		item = frm.doc.items[0];

		for (var i = 0; i < frm.doc.numero_bloques; i++) {
			d = frappe.model.add_child(frm.doc, "Purchase Receipt Item", "items");
			for (var property_name in item) {
				if (!helper.In(property_name, ["idx", "docstatus", "doctype", "name", "__islocal", "owner", "parent", "parent_field", "parent_type"])) {
					frappe.model.set_value(d.doctype, d.name, property_name, item[property_name]);	
				}
			}
		}
		refresh_field("items");
	}
});

