
frappe.ui.form.ControlButton = frappe.ui.form.ControlButton.extend({
	make_input: function() {
		var me = this;
		this.$input = $('<button class="btn btn-warning">')
			.prependTo(me.input_area)
			.on("click", function() {
				me.onclick();
			});
		this.input = this.$input.get(0);
		this.set_input_attributes();
		this.has_input = true;
		this.toggle_label(false);
	}
});