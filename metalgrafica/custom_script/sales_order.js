
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
	},

	letter_head: function(frm) {
		
	}
	
});