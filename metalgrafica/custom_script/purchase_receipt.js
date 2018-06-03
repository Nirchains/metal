cur_frm.get_field("supplied_items").grid.toggle_enable("consumed_qty",true);
cur_frm.get_field("supplied_items").grid.toggle_enable("required_qty",true);
cur_frm.refresh_fields();

frappe.ui.form.on("Purchase Receipt", {
	onload: function(frm) {
		if(frm.doc.__islocal) {
			frappe.call({
				method: "metalgrafica.util.get_next_batch",
				callback: function(r) {
					if(r.message) {
						console.log("Inicio de secuencia: " + r.message);
						frm.set_value("inicio_de_secuencia", r.message[0][0]);
					}					
				}
			});
		} else {
			frm.toggle_display("bloques_section", false);
		}
	},
	generar_bloques: function(frm) {
		//Generamos los bloques
		if (!helper.ArrayIsNullOrEmpty(frm.doc.items)) {
			item = frm.doc.items[0];

			if (helper.IsNullOrEmpty(frm.doc.inicio_de_secuencia)) {
				cur_frm.cscript.purchase_receipt.duplicar_productos(frm, item, frm.doc.numero_bloques, null);		
			} else {
				cur_frm.cscript.purchase_receipt.crear_lotes(frm, item, frm.doc.inicio_de_secuencia, frm.doc.numero_bloques, item.item_code);
			}

		} else {
			msgprint("Antes de generar los bloques, debe introducir al menos un producto en la lista de productos recibidos");
		}
	}
});

cur_frm.cscript.purchase_receipt = {
	duplicar_productos: function (frm, item, numero_bloques, lotes) {
		//Duplicamos los productos
		var d;
		frappe.model.clear_table(frm.doc,"items");
		for (var i = 0; i < frm.doc.numero_bloques; i++) {
			d = frm.add_child("items");

			for (var property_name in item) {

				if (!helper.In(property_name, ["idx", "docstatus", "doctype", "name", "__islocal", "owner", "parent", "parent_field", "parent_type", "batch_no"])) {
					d[property_name] = item[property_name];
	                		
				}
			}

			if (!helper.ArrayIsNullOrEmpty(lotes)) {
				console.log(lotes[i].id.toString());
				d["batch_no"] = lotes[i].id.toString();
			}

			frm.refresh_field("items");
		}
	},

	crear_lotes: function(frm, item, inicio_de_secuencia, numero_bloques, item_code) {
		if (!helper.IsNullOrEmpty(inicio_de_secuencia)) {

			frappe.call({
				method: "metalgrafica.util.create_batch_secuence",
				args: {
					"inicio_de_secuencia": inicio_de_secuencia,
					"producto": item_code,
					"numero_bloques": numero_bloques
				},
				callback: function(r) {
					if(!r.message) {
						msgprint("No se han creado lotes");
					} else {
						cur_frm.cscript.purchase_receipt.duplicar_productos(frm, item, numero_bloques, r.message);	
					}					
				}
			});
		}

	}
};

