// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt


erpnext.StockAnalytics = erpnext.StockGridReport.extend({
	init: function(wrapper, opts) {
		var args = {
			title: __("Stock Analytics"),
			parent: $(wrapper).find('.layout-main'),
			page: wrapper.page,
			doctypes: ["Item", "Item Group", "Warehouse", "Stock Ledger Entry", "Brand",
				"Fiscal Year", "Serial No", "Formato", "Acabado"],
			tree_grid: {
				show: true,
				parent_field: "parent_item_group",
				formatter: function(item) {
					if(!item.is_group) {
						return repl("<a \
							onclick='frappe.cur_grid_report.show_stock_ledger(\"%(value)s\")'>\
							%(value)s</a>", {
								value: item.name,
							});
					} else {
						return item.name;
					}

				}
			},
		}

		if(opts) $.extend(args, opts);

		this._super(args);

		this.set_default_values()
	},
	set_default_values: function() {
		var values = {
			from_date: frappe.datetime.str_to_user(frappe.sys_defaults.year_start_date),
			to_date: moment(new Date()).format("DD-MM-YYYY")
		}
		var me = this;
		$.each(values, function(i, v) {
			if(me.filter_inputs[i] && !me.filter_inputs[i].val())
				me.filter_inputs[i].val(v);
		})

	},
	setup_columns: function() {
		var std_columns = [
			{id: "_check", name: __("Plot"), field: "_check", width: 30,
				formatter: this.check_formatter},
			{id: "name", name: __("Item"), field: "name", width: 600,
				formatter: this.tree_formatter},
			{id: "opening", name: __("Opening"), field: "opening", hidden: true,
				formatter: this.currency_formatter}
		];

		this.make_date_range_columns();
		this.columns = std_columns.concat(this.columns);
	},
	filters: [
		{fieldtype:"Select", label: __("Value or Qty"), fieldname: "value_or_qty",
			options:[{label:__("Value"), value:"Value"},{label:__("Quantity"), value:"Quantity"}],
			filter: function(val, item, opts, me) {
				return me.apply_zero_filter(val, item, opts, me);
			}},
		{fieldtype:"Date", label: __("From Date"), fieldname: "from_date"},
		{fieldtype:"Date", label: __("To Date"), fieldname: "to_date"},
		{fieldtype:"Select", label: __("Range"), fieldname: "range",
			options:[
				{label:__("Daily"), value:"Daily"},
				{label:__("Weekly"), value:"Weekly"},
				{label:__("Monthly"), value:"Monthly"},
				{label:__("Quarterly"), value:"Quarterly"},
				{label:__("Yearly"), value:"Yearly"},
			]},

		{fieldtype:"Select", label: __("Item Group"), link:"Item Group", fieldname: "parent_item_group", is_group: 0,
			default_value: __("Seleccione el grupo ..."), filter: function(val, item, opts) {
				return val == opts.default_value || item.parent_item_group == val || item._show;
			}, link_formatter: {filter_input: "parent_item_group"}},
		{fieldtype:"Select", label: __("Formato"), link:"Formato", fieldname: "formato",
			default_value: __("Selecciona el formato..."), filter: function(val, item, opts) {
				return val == opts.default_value || item.formato == val || item._show;
			}, link_formatter: {filter_input: "formato"}},
		{fieldtype:"Select", label: __("Warehouse"), link:"Warehouse", fieldname: "warehouse",
			default_value: __("Seleccione el almacén"),
			filter: function(val, item, opts, me) {
				return me.no_apply_zero_filter(val, item, opts, me);
			}},
		{fieldtype:"Select", label: __("Brand"), link:"Brand", fieldname: "brand",
			default_value: __("Seleccione la marca..."), filter: function(val, item, opts) {
				return val == opts.default_value || item.brand == val || item._show;
			}, link_formatter: {filter_input: "brand"}},
		{fieldtype:"Data", label: __("Composición"), fieldname: "composicion",
			filter: function(val, item, opts) {
				var composicion = (item.composicion == null ? '' : item.composicion);
				return composicion.includes(val) || item._show;
			}},
		{fieldtype:"Select", label: __("Acabado"), link:"Acabado", fieldname: "acabado",
			default_value: __("Selecciona el acabado..."), filter: function(val, item, opts) {
				return val == opts.default_value || item.acabado == val || item._show;
			}, link_formatter: {filter_input: "acabado"}},
	],
	setup_filters: function() {
		var me = this;
		this._super();

		this.trigger_refresh_on_change(["value_or_qty", "brand", "parent_item_group", "warehouse", "range", "formato", "composicion", "acabado"]);

		this.show_zero_check();
		this.setup_chart_check();
	},

	show_zero_check: function() {
		var me = this;
		this.wrapper.bind('make', function() {
			me.wrapper.find('.show-zero').toggle(true).find('input').prop('checked', true);
			me.wrapper.find('.show-zero').toggle(true).find('input').click(function(){
				me.refresh();
			});
		});
	},
	init_filter_values: function() {
		this._super();
		this.filter_inputs.range && this.filter_inputs.range.val('Quarterly');
		this.filter_inputs.value_or_qty && this.filter_inputs.value_or_qty.val('Quantity');
	},
	no_apply_zero_filter: function(val, item, opts, me) {
		// show only non-zero values
		if(!this.is_default("warehouse")) {
			for(var i=0, j=me.columns.length; i<j; i++) {
				var col = me.columns[i];
				if(col.formatter==me.currency_formatter && !col.hidden) {
					if(flt(item[col.field]) > 0.001 ||  flt(item[col.field]) < -0.001) {
						return true;
					}
				}
			}
			return false;
		}
		return true;
	},
	prepare_data: function() {
		var me = this;

		if(!this.data) {
			var items = this.prepare_tree("Item", "Item Group");

			me.parent_map = {};
			me.item_by_name = {};
			me.data = [];

			$.each(items, function(i, v) {
				var d = copy_dict(v);

				me.data.push(d);
				me.item_by_name[d.name] = d;
				if(d.parent_item_group) {
					me.parent_map[d.name] = d.parent_item_group;
				}
				me.reset_item_values(d);
			});
			this.set_indent();
			this.data[0].checked = true;
		} else {
			// otherwise, only reset values
			$.each(this.data, function(i, d) {
				me.reset_item_values(d);
				d["closing_qty_value"] = 0;
			});
		}

		this.prepare_balances();
		this.update_groups();

	},
	prepare_balances: function() {
		var me = this;
		var from_date = frappe.datetime.str_to_obj(this.from_date);
		var to_date = frappe.datetime.str_to_obj(this.to_date);
		var data = frappe.report_dump.data["Stock Ledger Entry"];

		this.item_warehouse = {};
		this.serialized_buying_rates = this.get_serialized_buying_rates();

		for(var i=0, j=data.length; i<j; i++) {
			var sl = data[i];
			sl.posting_datetime = sl.posting_date + " " + sl.posting_time;
			var posting_datetime = frappe.datetime.str_to_obj(sl.posting_datetime);

			if(me.is_default("warehouse") ? true : me.warehouse == sl.warehouse) {
				var item = me.item_by_name[sl.item_code];
				if(item.closing_qty_value==undefined) item.closing_qty_value = 0;

				if(me.value_or_qty!="Quantity") {
					var wh = me.get_item_warehouse(sl.warehouse, sl.item_code);
					var valuation_method = item.valuation_method ?
						item.valuation_method : frappe.sys_defaults.valuation_method;
					var is_fifo = valuation_method == "FIFO";

					if(sl.voucher_type=="Stock Reconciliation") {
						var diff = (sl.qty_after_transaction * sl.valuation_rate) - item.closing_qty_value;
						wh.fifo_stack = [[sl.qty_after_transaction, sl.valuation_rate, sl.posting_date]];
						wh.balance_qty = sl.qty_after_transaction;
						wh.balance_value = sl.valuation_rate * sl.qty_after_transaction;
					} else {
						var diff = me.get_value_diff(wh, sl, is_fifo);
					}
				} else {
					if(sl.voucher_type=="Stock Reconciliation") {
						var diff = sl.qty_after_transaction - item.closing_qty_value;
					} else {
						var diff = sl.qty;
					}
				}

				if(posting_datetime < from_date) {
					item.opening += diff;
				} else if(posting_datetime <= to_date) {
					item[me.column_map[sl.posting_date].field] += diff;
				} else {
					break;
				}

				item.closing_qty_value += diff;
			}
		}
	},
	update_groups: function() {
		var me = this;
		$.each(this.data, function(i, item) {
			// update groups
			if(!item.is_group && me.apply_filter(item, "brand")) {
				var balance = item.opening;
				$.each(me.columns, function(i, col) {
					if(col.formatter==me.currency_formatter && !col.hidden) {
						item[col.field] = balance + item[col.field];
						balance = item[col.field];
					}
				});

				var parent = me.parent_map[item.name];
				while(parent) {
					var parent_group = me.item_by_name[parent];
					$.each(me.columns, function(c, col) {
						if (col.formatter == me.currency_formatter) {
							parent_group[col.field] =
								flt(parent_group[col.field])
								+ flt(item[col.field]);
						}
					});
					parent = me.parent_map[parent];
				}
			}
		});
	},
	show_stock_ledger: function(item_code) {
		frappe.route_options = {
			item_code: item_code,
			from_date: this.from_date,
			to_date: this.to_date
		};
		frappe.set_route("query-report", "Stock Ledger");
	}
});

