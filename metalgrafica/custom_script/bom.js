

frappe.ui.form.on('BOM', {
	cargar_materiales: function(frm) {
		cur_frm.cscript.load_bom_materials_from_item(frm);
		cur_frm.cscript.load_qty_from_item(frm);
	},

	cargar_operaciones: function(frm) {
		cur_frm.cscript.load_bom_operations_from_item(frm);
	}
});

frappe.ui.form.on("BOM Operation", "workstation", function(frm, cdt, cdn) {
	var d = locals[cdt][cdn];

	if(!d.workstation) return;

	frappe.call({
		"method": "frappe.client.get",
		args: {
			doctype: "Workstation",
			name: d.workstation
		},
		callback: function (data) {
			if(data.message.time_in_mins) {
				frappe.model.set_value(d.doctype, d.name, "time_in_mins", data.message.time_in_mins);
			}
		}
	})
});

//Funciones adicionales
$.extend(cur_frm.cscript, {
	load_bom_materials_from_item: function(frm) {
		if (frm.doc["item"]) {
			frappe.model.clear_table(frm.doc,"items");
			frappe.call({
				method: "metalgrafica.bom.load_bom_materials_from_item",
				args: {
					"item": frm.doc["item"]
				},
				callback: function(r) {
					if(!r.message) {
						//frappe.throw(__("El grupo de productos no contiene ninguna plantilla de materiales"))
					} else {
						$.each(r.message, function(i, item) {
							var d = frappe.model.add_child(frm.doc, "BOM Item", "items");
							frappe.model.set_value(d.doctype, d.name, "qty", flt(item.qty));
							frappe.model.set_value(d.doctype, d.name, "scrap", item.scrap);
							frappe.model.set_value(d.doctype, d.name, "item_group", item.item_group);
							frappe.model.set_value(d.doctype, d.name, "item_code", item.item_code);
						});
					}
					refresh_field("items");
				}
			});
		}
	},

	load_bom_operations_from_item: function(frm) {
		if (frm.doc["item"]) {
			frappe.model.clear_table(frm.doc,"operations");
			frappe.call({
				method: "metalgrafica.bom.load_bom_operations_from_item",
				args: {
					"item": frm.doc["item"]
				},
				callback: function(r) {
					if(!r.message) {
						//frappe.throw(__("El grupo de productos no contiene ninguna plantilla de operaciones"))
					} else {
						$.each(r.message, function(i, item) {
							var e = frappe.model.add_child(frm.doc, "BOM Operation", "operations");
							frappe.model.set_value(e.doctype, e.name, "operation", item.operation);
							//frappe.model.set_value(e.doctype, e.name, "workstation", item.workstation);
							//frappe.model.set_value(e.doctype, e.name, "description", item.description);
							frappe.model.set_value(e.doctype, e.name, "image", item.image);
						});
						refresh_field("operations");
						
					}
					
				}
			});
		}
	},

	load_qty_from_item: function(frm) {
		if (frm.doc["item"]) {
			frappe.call({
				method: "metalgrafica.bom.load_qty_from_item",
				args: {
					"item": frm.doc["item"]
				},
				callback: function(r) {
					frm.doc.quantity = r.message;
					refresh_field("quantity");
					cur_frm.refresh_fields();
				}
			});
		}
	}

});