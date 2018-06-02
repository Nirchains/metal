from __future__ import unicode_literals

import frappe

@frappe.whitelist()
def get_data(item_code=None, warehouse=None, item_group=None, brand=None,formato=None, composicion=None, acabado=None, show_zero_stock=0,
	start=0, sort_by='actual_qty', sort_order='desc'):
	'''Return data to render the item dashboard'''
	conditions = []
	values = []
	if item_code:
		conditions.append('i.item_code=%s')
		values.append(item_code)
	if warehouse:
		conditions.append('b.warehouse=%s')
		values.append(warehouse)
	if item_group:
		conditions.append('i.item_group=%s')
		values.append(item_group)
	if brand:
		conditions.append('i.brand=%s')
		values.append(brand)
	if formato:
		conditions.append('i.formato=%s')
		values.append(formato)
	if composicion:
		conditions.append('i.composicion like %s')
		values.append('%%' + composicion + '%%')
	if acabado:
		conditions.append('i.acabado=%s')
		values.append(acabado)
	if show_zero_stock == '0':
		conditions.append('(b.projected_qty != 0 or b.reserved_qty != 0 or b.reserved_qty_for_production != 0 or b.actual_qty != 0)')
	if conditions:
		conditions = ' and ' + ' and '.join(conditions)
	else:
		conditions = ''

	return frappe.db.sql('''
	select
		i.item_code, b.warehouse, i.default_warehouse, b.projected_qty, b.reserved_qty,
		b.reserved_qty_for_production, b.actual_qty, b.valuation_rate, i.item_name
	from
		tabItem i left join tabBin b		
		on b.item_code = i.name
	where
		1=1
		{conditions}
	order by
		{sort_by} {sort_order}
	limit
		{start}, 51
	'''.format(conditions=conditions, sort_by=sort_by, sort_order=sort_order,
		start=start), values, as_dict=True)
