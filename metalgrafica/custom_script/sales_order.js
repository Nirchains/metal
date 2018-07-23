
cur_frm.add_fetch("customer", "plazo_de_entrega", "plazo_de_entrega");
cur_frm.add_fetch("customer", "mode_of_payment", "metodo_de_pago");
cur_frm.add_fetch("customer", "days_of_payment", "dias_de_pago");
cur_frm.add_fetch("customer", "portes", "portes");

frappe.ui.form.on('Sales Order', {
	/*TODO
	setup_queries: function() {
		var me = this;

		me.frm.set_query('customer_address_reference', function (doc) {
			return {
				query: 'frappe.contacts.doctype.address.address.address_query',
				filters: {
					link_doctype: "customer",
					link_name: me.frm.doc.cliente_de_referencia
				}
			};
		});
	},*/

	refresh: function(frm) {
		frm.toggle_reqd("cliente_de_referencia", helper.In(frm.doc.customer,["AUXIMARA,S.A."]));
		frm.toggle_reqd("source", helper.In(frm.doc.customer,["AUXIMARA,S.A."]));

		frm.refresh_fields();

		//Forzar que el formato de impresión sea siempre el mismo
		frm.set_value('letter_head','Estándar');

		if(!frm.doc.__islocal) {
			frm.add_custom_button(__("Generar pedidos de litografía"),
				function() {
					cur_frm.cscript.sales_order.create_material_request(frm);
					//cur_frm.cscript.sales_order.create_material_request_dialog(frm);
				}
			);
		}

	},

	cliente_de_referencia: function(frm) {
		
	},

	customer_address_reference: function(frm) {
		frappe.call({
			method: "frappe.contacts.doctype.address.address.get_address_display",
			args: {"address_dict": frm.doc["customer_address_reference"] },
			callback: function(r) {
				if(r.message) {
					frm.set_value("address_display_reference", r.message)
				}
				//erpnext.utils.set_taxes(frm, address_field, display_field, is_your_company_address);
			}
		});
	}

	
});

//Child tables add_fetch
cur_frm.add_fetch("item_code", "observaciones", "observaciones");

cur_frm.cscript.sales_order = {
	create_material_request: function(frm) {
		var default_bom = "";

		$.each(frm.doc["items"] || [], function(i, item) {
			if (!helper.IsNullOrEmpty(item.item_code)) {
				if (item.item_code.startsWith("LATA-")) {
					frappe.call({
						type: "GET",
						method: "erpnext.stock.get_item_details.get_default_bom",
						args: {
							"item_code": item.item_code,
						},
						callback: function(r) {
							if(r) {
								default_bom = r.message;
								cur_frm.cscript.sales_order.create_material_request_dialog(frm, default_bom, item.qty, item.warehouse)
							}
						}
					});
				}
			}
		});


		
	},

	create_material_request_dialog: function(frm, default_bom, default_qty, default_warehouse) {
		var d = new frappe.ui.Dialog({
			title: __("Generar pedidos de litografía"),
			fields: [
				{"fieldname":"sales_order", "fieldtype":"Link", "label":__("Sales Order"),
					options:"Sales Order", reqd: 1, read_only: 1, default: frm.doc.name },
				{"fieldname":"bom_no", "fieldtype":"Link", "label":__("BOM"),
					options:"BOM", reqd: 1, read_only: 1, default: default_bom, get_query: function(){
						return {filters: { docstatus:1 }}
					}},
				{"fieldname":"planned_qty", "fieldtype":"Int", "label":__("Qty"),
					reqd: 1, default: default_qty},
				{"fieldname":"alternative_default_warehouse", "fieldtype":"Link", "label":__("Warehouse"),
					options:"Warehouse", reqd: 1, default: default_warehouse},
				{fieldname:"create_material_requests_for_all_required_qty", "fieldtype":"Check",
					"label":__("Crear para la cantidad completa, ignorando la cantidad que ya está en orden"), default: 0},
				{fieldname:"fetch", "label":__("Crear solicitudes de materiales"), "fieldtype":"Button"},

				
			]
		});
		d.get_input("fetch").on("click", function() {
			var values = d.get_values();
			console.log(values);			
			frappe.call({
				method: "metalgrafica.metalgrafica.doctype.planificar_produccion.planificar_pedido.raise_material_requests",
				args: values,
				callback: function(r) {
					console.log(r.message);
					/*
					if(!r.message) {
						frappe.throw(__("BOM does not contain any stock item"))
					} else {
						erpnext.utils.remove_empty_first_row(cur_frm, "items");
						$.each(r.message, function(i, item) {
							var d = frappe.model.add_child(cur_frm.doc, "Material Request Item", "items");
							d.item_code = item.item_code;
							d.item_name = item.item_name;
							d.description = item.description;
							d.warehouse = values.warehouse;
							d.uom = item.stock_uom;
							d.qty = item.qty;
						});
					}
					d.hide();
					refresh_field("items");*/
				}
			});
		});
		d.show();
	}
}