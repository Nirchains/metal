function format_currency(v, currency, decimals) {
	var format = get_number_format(currency);
	var symbol = get_currency_symbol(currency);
	if(decimals === undefined) {
		decimals = frappe.boot.sysdefaults.currency_precision || null;
	}

	if (symbol)
		return format_number(v, format, decimals) + " " + symbol;
	else
		return format_number(v, format, decimals);
}

function show_tooltips() {
	$('input').hover(
	  	function(){
	    	$(this).attr('title', $(this).val());
	  	}
	);
}