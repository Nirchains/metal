//FIX https://github.com/frappe/frappe/pull/3605/files
frappe.ui.keys.get_key = function(e) {
	var keycode = e.keyCode || e.which;
	var key = frappe.ui.keys.key_map[keycode] || String.fromCharCode(keycode);

	if(e.ctrlKey || e.metaKey) {
		// add ctrl+ the key
		key = 'ctrl+' + key;
	}
	if(e.shiftKey) {
		// add ctrl+ the key
		key = 'shift+' + key;
	}
	return key.toLowerCase();
}

frappe.ui.keys.key_map = {
	8: 'backspace',
//	9: 'tab',
	13: 'enter',
//	16: 'shift',
	17: 'ctrl',
	91: 'meta',
	18: 'alt',
	27: 'escape',
	37: 'left',
 	39: 'right',
 	38: 'up',
 	40: 'down',
 	32: 'space'
}