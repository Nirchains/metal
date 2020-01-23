frappe.provide("util");

$.extend(util, {
	get: function(frm, doctype, name, filters, callback) {
		return frappe.call({
			method: "frappe.client.get",
			args: {
				doctype: doctype,
				name: name
			},
			callback: function(r, rt) {
				callback && callback(r.message, frm);
			}
		});
	},

	set_value_if_no_null(frm, name, value) {
		if (helper.IsNullOrEmpty(value)) {
			frm.set_value(name,'');
		} else {
			frm.set_value(name,value);
		}
	},

	set_value_only_if_no_null(frm, name, value) {
		if (!helper.IsNullOrEmpty(value)) {
			frm.set_value(name,value);
		}
	},

	transform_zero_to_empty: function(frm, name) {
		if (helper.IsNullOrEmpty(frm.doc[name])) {
			frm.set_value(name, '');
		}
	},

	toggle_display_and_required: function(frm,name,condition) {
		frm.toggle_display(name, condition);
		frm.toggle_reqd(name, condition);
	},

	toggle_enable_and_required: function(frm,name,condition) {
		frm.toggle_enable(name, condition);
		frm.toggle_reqd(name, condition);
	},	

	toggle_display_and_not_required: function(frm,name,condition) {
		frm.toggle_display(name, condition);
		frm.toggle_reqd(name, false);
	},
	show_tooltips: function () {
		$('input').hover(
		  	function(){
		    	$(this).attr('title', $(this).val());
		  	}
		);
	}
});
