print = {
	pdf: function(format, with_letterhead, lang_code, printit) {
		var w = window.open(frappe.urllib.get_full_url("/api/method/frappe.utils.print_format.download_pdf?"
			+ "doctype=" + encodeURIComponent(cur_frm.doc.doctype)
			+ "&name=" + encodeURIComponent(cur_frm.doc.name)
			+ (printit ? "&trigger_print=1" : "")
			+ "&format=" + format
			+ "&no_letterhead=" + (with_letterhead ? "0" : "1")
			+ (lang_code ? ("&_lang=" + lang_code) : "")));
		if (!w) {
			frappe.msgprint(__("Please enable pop-ups")); return;
		}
	},

	html: function(format, with_letterhead, lang_code, printit) {
		var w = window.open(frappe.urllib.get_full_url("/printview?"
			+ "doctype=" + encodeURIComponent(cur_frm.doc.doctype)
			+ "&name=" + encodeURIComponent(cur_frm.doc.name)
			+ (printit ? "&trigger_print=1" : "")
			+ "&format=" + format
			+ "&no_letterhead=" + (with_letterhead ? "0" : "1")
			+ (lang_code ? ("&_lang=" + lang_code) : "")));
		if (!w) {
			frappe.msgprint(__("Please enable pop-ups")); return;
		}
	}
}