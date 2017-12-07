util = {
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
	}
};

helper = {
	IsNull: function (obj) {
        return (obj === null || obj === undefined || obj === 'undefined');
    },

    IsString: function (obj) {
        return typeof obj === 'string';
    },

    IsNumber: function (obj) {
        return typeof obj === 'number';
    },

    IsNullOrEmpty: function (obj) {
        return (this.IsNull(obj) || obj === {} || obj === '' || obj === 0 || obj === '0');
    },

    NumberIsNullOrZero: function (obj) {
        return (this.IsNull(obj) || obj === 0 || obj === '0');
    },

    StringIsNullOrEmpty: function (obj) {
        return (this.IsNull(obj) || obj === '');
    },

    ArrayIsNullOrEmpty: function (obj) {
        return (this.IsNull(obj) || obj.length === 0);
    },

    IsTrue: function (obj) {
        return (!this.IsNull(obj) && (obj === 'true' || obj === true || obj === 1));
    },

    IsFalse: function (obj) {
        return !this.IsTrue(obj);
    },

    IsEmpty: function (str) {
        return (str.trim().length === 0);
    },
    
    ParseInt: function (num) {
        return parseInt(num);
    },

    In: function(obj, arr) {
    	return (arr.indexOf(obj) != -1);
    }

}