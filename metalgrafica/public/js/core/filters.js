frappe.ui.FilterList = frappe.ui.FilterList.extend({
	clear_filters_by_name: function(name) {
		$.each(this.filters, function(i, f) { f.remove(true); });
		if(this.base_list.page.fields_dict) {
			$.each(this.base_list.page.fields_dict, (key, value) => {
				if (key==name) {
					value.set_input('');
				}
			});
		}
		this.filters = [];
	}
});