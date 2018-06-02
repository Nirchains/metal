frappe.pages['analisis-de-existenc'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Analisis de existencias',
		single_column: true
	});
	
	frappe.require(["assets/metalgrafica/js/report/stock_grid_report.js",
		"assets/metalgrafica/js/report/stock_analytics.js"], function() {
		new erpnext.StockAnalytics(wrapper);
		frappe.breadcrumbs.add("Metalgrafica")
	});
}
