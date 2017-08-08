frappe.ui.form.on('BOM', {
	cargar_materiales: function(frm) {
		cur_frm.cscript.cargar_materiales_desde_producto(frm);
	}
});

//Funciones adicionales
$.extend(cur_frm.cscript, {
	cargar_materiales_desde_producto: function(frm) {
		if (frm.doc["item"]) {
			frappe.call({
				method: "metalgrafica.util.cargar_materiales_desde_producto",
				args: {
					"item": frm.doc["item"]
				},
				callback: function(r) {
					if(!r.message) {
						frappe.throw(__("El grupo de productos no contiene ninguna plantilla de materiales"))
					} else {
						console.log(r.message);
						$.each(r.message, function(i, item) {
							var d = frappe.model.add_child(frm.doc, "BOM Item", "items");
							d.item_group = item.item_group;
							d.item_code = item.item_code;
							d.qty = item.qty;
							/*
							d.image = item.image;
							d.amount = item.amount;
							d.base_amount = item.base_amount;
							d.bom_no = item.bom_no;
							d.description = item.description;
							d.qty_consumed_per_unit = item.qty_consumed_per_unit;
							d.rate = item.rate;
							d.scrap = item.scrap;
							d.stock_uom = item.stock_uom;*/
						});
					}
					refresh_field("items");
				}
			});
		}
	}
});