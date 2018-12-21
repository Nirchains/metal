frappe.provide('frappe.ui.keys.handlers');

frappe.ui.keys.on('dotted', function(evt) {
	insertTextAtCursor(",");
    return false;	
});

function insertTextAtCursor(text) {
	var a = document.activeElement;
	if (a.tagName.toLowerCase() == 'input') {
		a.value += ',';
	}
}

frappe.ui.keys.key_map = {
	8: 'backspace',
	9: 'tab',
	13: 'enter',
	16: 'shift',
	17: 'ctrl',
	91: 'meta',
	18: 'alt',
	27: 'escape',
	37: 'left',
	39: 'right',
	38: 'up',
	40: 'down',
	32: 'space',
	112: 'f1',
	113: 'f2',
	114: 'f3',
	115: 'f4',
	116: 'f5',
	110: 'dotted',
	190: 'dot'
}