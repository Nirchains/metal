
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