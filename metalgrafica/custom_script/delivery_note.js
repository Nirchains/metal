frappe.ui.form.on("Delivery Note", {

	refresh: function (frm) {
		if(!frm.doc.__islocal) {
			frm.add_custom_button(__("Imprimir albarán"),
				function() {
					cur_frm.cscript.delivery_note.print_delivery_note(frm);
				});
		}
	}


});

cur_frm.cscript.delivery_note = {
	print_delivery_note: function(frm) {
		var format = "Albaran de Entrega";
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

