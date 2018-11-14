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

	refresh: function (frm) {
		if(!frm.doc.__islocal) {
			frm.add_custom_button(__("Imprimir confirmación"),
				function() {
					cur_frm.cscript.quotation.print(frm);
				});
		}
	},

	validate: function(frm) {
		
	},

	customer: function(frm) {
		if (!helper.IsNullOrEmpty(frm.doc.customer)) {
			frappe.db.get_value("Customer",frm.doc.customer,"tc_name_quotation").then((r) => {
				frm.set_value("tc_name",r.message.tc_name_quotation);
			});
		}
	},
	company: function(frm) {
		if(frm.doc.company) {
			//Colocamos el membrete del parámetro guardado en la configuración
			frappe.db.get_value('Company', frm.doc.company, 'default_letter_head_quotation').then((r) => {
				if(r.message.default_letter_head_quotation) {
					frm.set_value("letter_head", r.message.default_letter_head_quotation);
				} 
			});
		}
		frm.trigger("toggle_display_account_head");
	}
	

	
});

//Child tables add_fetch
cur_frm.add_fetch("item_code", "nombre_para_cliente", "nombre_para_cliente");
cur_frm.add_fetch("item_code", "observaciones", "observaciones");

cur_frm.cscript.quotation = {
	print: function(frm) {
		var format = "Confirmacion de pedido";
		var with_letterhead = true;
		var lang_code = "ES";
		var printit = true;
		var w = window.open(frappe.urllib.get_full_url("/api/method/frappe.utils.print_format.download_pdf?"
			+ "doctype=" + encodeURIComponent(frm.doc.doctype)
			+ "&name=" + encodeURIComponent(frm.doc.name)
			+ (printit ? "&trigger_print=1" : "")
			+ "&format=" + format
			+ "&no_letterhead=" + (with_letterhead ? "0" : "1")
			+ (lang_code ? ("&_lang=" + lang_code) : "")));
		if (!w) {
			frappe.msgprint(__("Please enable pop-ups")); return;
		}
	}
}