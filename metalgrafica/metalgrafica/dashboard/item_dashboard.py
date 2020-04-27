from __future__ import unicode_literals

import frappe

@frappe.whitelist()
def get_data(item_code=None, warehouse=None, item_group=None, brand=None,formato=None, composicion=None, acabado=None, show_zero_stock=0,
	start=0, sort_by='actual_qty', sort_order='desc'):
	'''Return data to render the item dashboard'''
	conditions = []
	values = []
	if item_code:
		conditions.append('i.name=%s')
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

	stock_resumen = frappe.db.sql('''
	select
		i.name, i.item_code, b.warehouse, i.default_warehouse, b.projected_qty, b.reserved_qty,
		b.reserved_qty_for_production, b.actual_qty, b.valuation_rate, i.item_name, i.stock_uom as uom
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

	for warehouse in stock_resumen:
		conditionsw = []
		valuesw = []

		conditionsw.append('sle.item_code = %s')
		valuesw.append(warehouse.item_code)

		conditionsw.append('sle.warehouse = %s')
		valuesw.append(warehouse.warehouse)

		conditionsw = ' and ' + ' and '.join(conditionsw)

		sql_batches = '''
			select sle.warehouse, sle.batch_no, round(sum(sle.actual_qty),2) as qty
			from `tabStock Ledger Entry` sle
				INNER JOIN `tabBatch` batch on sle.batch_no = batch.name
				INNER JOIN `tabItem` it on sle.item_code = it.name
			where
				batch.disabled = 0
				and batch.docstatus < 2
				%(conditionsw)s
				group by sle.batch_no, sle.warehouse
			''' % {
				'conditionsw': conditionsw
			}

		sql_batches = ''' select * from (%(sql)s) q where q.qty > 0	
			''' % {	'sql': sql_batches	}

		warehouse.batches = frappe.db.sql(sql_batches, valuesw, as_dict=1)

	return stock_resumen
