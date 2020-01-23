frappe.provide("helper");

$.extend(helper, {
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

});