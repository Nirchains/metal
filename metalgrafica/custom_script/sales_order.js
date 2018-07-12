
cur_frm.add_fetch("customer", "plazo_de_entrega", "plazo_de_entrega");
cur_frm.add_fetch("customer", "mode_of_payment", "metodo_de_pago");
cur_frm.add_fetch("customer", "days_of_payment", "dias_de_pago");
cur_frm.add_fetch("customer", "portes", "portes");

frappe.ui.form.on('Sales Order', {
	refresh: function(frm) {
		frm.toggle_reqd("cliente_de_referencia", helper.In(frm.doc.customer,["AUXIMARA,S.A."]));
		frm.toggle_reqd("source", helper.In(frm.doc.customer,["AUXIMARA,S.A."]));

		frm.refresh_fields();

		//Forzar que el formato de impresión sea siempre el mismo
		frm.set_value('letter_head','Estándar');

		if(!frm.doc.__islocal) {
			frm.add_custom_button(__("Crear solicitudes de materiales"),
				function() {
					cur_frm.cscript.sales_order.create_material_request(frm);
					//cur_frm.cscript.sales_order.create_material_request_dialog(frm);
				}
			);
		}
	},

	letter_head: function(frm) {
		
	}
	
});

//Child tables add_fetch
cur_frm.add_fetch("item_code", "observaciones", "observaciones");

cur_frm.cscript.sales_order = {
	create_material_request: function(frm) {
		var d = new frappe.ui.Dialog({
			title: __("Obtener productos desde el BOM"),
			fields: [
				{"fieldname":"parent", "fieldtype":"Link", "label":__("BOM"),
					options:"BOM", reqd: 1, get_query: function(){
						return {filters: { docstatus:1 }}
					}},
				{"fieldname":"qty", "fieldtype":"Int", "label":__("Qty"),
					reqd: 1},
				{"fieldname":"warehouse", "fieldtype":"Link", "label":__("Warehouse"),
					options:"Warehouse", reqd: 1},
				{"fieldname":"fetch_exploded", "fieldtype":"Check",
					"label":__("Fetch exploded BOM (including sub-assemblies)"), "default":1},
				{fieldname:"create_material_requests_for_all_required_qty", "fieldtype":"Check",
					"label":__("Create for full quantity, ignoring quantity already on order"), "default":0},
				{fieldname:"fetch", "label":__("Get Items from BOM"), "fieldtype":"Button"},

				
			]
		});
		d.get_input("fetch").on("click", function() {
			var values = d.get_values();
			
			frappe.call({
				method: "metalgrafica.metalgrafica.doctype.planificar_produccion.planificar_produccion.get_all_nodes",
				args: values,
				callback: function(r) {
					console.log(r);
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
	},
	create_material_request_dialog: function(frm) {
		var d = new frappe.ui.Dialog({
			title: __("Obtener productos desde el BOM"),
			fields: [
				{"fieldname":"bom", "fieldtype":"Link", "label":__("BOM"),
					options:"BOM", reqd: 1, get_query: function(){
						return {filters: { docstatus:1 }}
					}},
				{"fieldname":"qty", "fieldtype":"Int", "label":__("Qty"),
					reqd: 1},
				{"fieldname":"warehouse", "fieldtype":"Link", "label":__("Warehouse"),
					options:"Warehouse", reqd: 1},
				{"fieldname":"fetch_exploded", "fieldtype":"Check",
					"label":__("Fetch exploded BOM (including sub-assemblies)"), "default":1},
				{fieldname:"create_material_requests_for_all_required_qty", "fieldtype":"Check",
					"label":__("Create for full quantity, ignoring quantity already on order"), "default":0},
				{fieldname:"fetch", "label":__("Get Items from BOM"), "fieldtype":"Button"},

				
			]
		});
		d.get_input("fetch").on("click", function() {
			var values = d.get_values();
			if(!values) return;
			values["company"] = cur_frm.doc.company;
			frappe.call({
				method: "erpnext.manufacturing.doctype.bom.bom.get_bom_items",
				args: values,
				callback: function(r) {
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
					refresh_field("items");
				}
			});
		});
		d.show();
	}
}