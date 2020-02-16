cur_frm.add_fetch("transporter_name_list", "dni", "transporter_dni");
cur_frm.add_fetch("transporter_name_list", "matricula_1", "matricula_1");
cur_frm.add_fetch("transporter_name_list", "matricula_2", "matricula_2");

frappe.ui.form.on("Delivery Note", {

	refresh: function (frm) {
		if(!frm.doc.__islocal) {
			frm.add_custom_button(__("Imprimir albarán"),
				function() {
					cur_frm.cscript.delivery_note.print_delivery_note(frm);
				});
		}
	},
	company: function(frm) {
		if(frm.doc.company) {
			frm.set_value("letter_head", "Solo encabezado");
		}
	}


});

cur_frm.cscript.delivery_note = {
	print_delivery_note: function(frm) {
		var format = "Albaran de Entrega";
		var with_letterhead = true;
		var lang_code = "ES";
		var printit = true;
		//print.pdf(format, with_letterhead, lang_code, printit);
		print.html(format, with_letterhead, lang_code, printit);
	}
}

