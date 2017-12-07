//cur_frm.add_fetch("customer", "tc_name_quotation", "tc_name");
cur_frm.add_fetch("customer", "plazo_de_entrega", "plazo_de_entrega");
cur_frm.add_fetch("customer", "mode_of_payment", "metodo_de_pago");
cur_frm.add_fetch("customer", "days_of_payment", "dias_de_pago");
cur_frm.add_fetch("customer", "portes", "portes");

frappe.ui.form.on("Quotation", {
	onload: function(frm) {

		
	},

	onload_post_render: function(frm) {
		
	},

	refresh: function(frm) {
		
	},

	validate: function(frm) {
		
	},

	customer: function(frm) {
		if (!helper.IsNullOrEmpty(frm.doc.customer)) {
			frappe.db.get_value("Customer",frm.doc.customer,"tc_name_quotation").then((r) => {
				frm.set_value("tc_name",r.message.tc_name_quotation);
			});
		}
	}
	

	
});

//Child tables add_fetch
cur_frm.add_fetch("item_code", "nombre_para_cliente", "nombre_para_cliente");
cur_frm.add_fetch("item_code", "observaciones", "observaciones");



