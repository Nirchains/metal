cur_frm.get_field("supplied_items").grid.toggle_enable("consumed_qty",true);
cur_frm.get_field("supplied_items").grid.toggle_enable("required_qty",true);
cur_frm.refresh_fields();

/*frappe.ui.form.on("Purchase Receipt", {
	refresh: function(frm) {
		var d = frappe.meta.get_docfield("Purchase Receipt Item Supplied", "consumed_qty", frm.doc.name);
		d.read_only = false;
		cur_frm.refresh_fields();
		console.log("entra1");
	}
});
*/
