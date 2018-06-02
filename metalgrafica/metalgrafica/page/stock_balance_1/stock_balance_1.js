frappe.pages['stock-balance-1'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Resúmenes de existencias'),
		single_column: true
	});
	page.start = 0;

	page.item_field = page.add_field({
		fieldname: 'item_code',
		label: __('Item'),
		fieldtype:'Link',
		options:'Item',
		change: function() {
			page.item_dashboard.start = 0;
			page.item_dashboard.refresh();
		}
	});

	page.item_group_field = page.add_field({
		fieldname: 'item_group',
		label: __('Item Group'),
		fieldtype:'Link',
		options:'Item Group',
		change: function() {
			page.item_dashboard.start = 0;
			page.item_dashboard.refresh();
		}
	});

	page.formato_field = page.add_field({
		fieldname: 'formato',
		label: __('Formato'),
		fieldtype:'Link',
		options:'Formato',
		change: function() {
			page.item_dashboard.start = 0;
			page.item_dashboard.refresh();
		}
	});

	page.warehouse_field = page.add_field({
		fieldname: 'warehouse',
		label: __('Warehouse'),
		fieldtype:'Link',
		options:'Warehouse',
		change: function() {
			page.item_dashboard.start = 0;
			page.item_dashboard.refresh();
		}
	});

	page.brand_field = page.add_field({
		fieldname: 'brand',
		label: __('Brand'),
		fieldtype:'Link',
		options:'Brand',
		change: function() {
			page.item_dashboard.start = 0;
			page.item_dashboard.refresh();
		}
	});

	page.composicion_field = page.add_field({
		fieldname: 'composicion',
		label: __('Composicion'),
		fieldtype:'Data',
		options:'Composicion',
		change: function() {
			page.item_dashboard.start = 0;
			page.item_dashboard.refresh();
		}
	});

	page.acabado_field = page.add_field({
		fieldname: 'acabado',
		label: __('Acabado'),
		fieldtype:'Link',
		options:'Acabado',
		change: function() {
			page.item_dashboard.start = 0;
			page.item_dashboard.refresh();
		}
	});

	page.show_zero_stock_field = page.add_field({
		fieldname: 'show_zero_stock',
		label: __('Mostrar stock 0'),
		fieldtype:'Check',
		default: 1,
		change: function() {
			page.item_dashboard.start = 0;
			page.item_dashboard.refresh();
		}
	});

	page.sort_selector = new frappe.ui.SortSelector({
		parent: page.wrapper.find('.page-form'),
		args: {
			sort_by: 'projected_qty',
			sort_order: 'asc',
			options: [
				{fieldname: 'projected_qty', label: __('Projected qty')},
				{fieldname: 'reserved_qty', label: __('Reserved for sale')},
				{fieldname: 'reserved_qty_for_production', label: __('Reserved for manufacturing')},
				{fieldname: 'actual_qty', label: __('Actual qty in stock')},
				{fieldname: 'item_name', label: __('Nombre del producto')},
			]
		},
		change: function(sort_by, sort_order) {
			page.item_dashboard.sort_by = sort_by;
			page.item_dashboard.sort_order = sort_order;
			page.item_dashboard.start = 0;
			page.item_dashboard.refresh();
		}
	});

	page.sort_selector.wrapper.css({'margin-right': '15px', 'margin-top': '4px'});

	frappe.require('assets/js/item-dashboard.min.js', function() {
		page.item_dashboard = new erpnext.stock.ItemDashboard({
			parent: page.main,
		})

		page.item_dashboard.before_refresh = function() {
			this.item_code = page.item_field.get_value();
			this.warehouse = page.warehouse_field.get_value();
			this.item_group = page.item_group_field.get_value();
			this.brand = page.brand_field.get_value();
			this.formato = page.formato_field.get_value();
			this.composicion = page.composicion_field.get_value();
			this.acabado = page.acabado_field.get_value();
			this.show_zero_stock = page.show_zero_stock_field.get_value();
		}

		page.item_dashboard.refresh();

		// item click
		var setup_click = function(doctype) {
			page.main.on('click', 'a[data-type="'+ doctype.toLowerCase() +'"]', function() {
				var name = $(this).attr('data-name');
				var field = page[doctype.toLowerCase() + '_field'];
				if(field.get_value()===name) {
					frappe.set_route('Form', doctype, name)
				} else {
					field.set_input(name);
					page.item_dashboard.refresh();
				}
			});
		}

		var get_link_open_icon = function(doctype, name) {
			return repl(' <a href="#Form/%(doctype)s/%(name)s">\
				<i class="fa fa-share" style="cursor: pointer;"></i></a>', {
					doctype: doctype,
					name: encodeURIComponent(name)
				});
		};

		setup_click('Item');
		setup_click('Warehouse');
		frappe.breadcrumbs.add("Metalgrafica")
	});


}