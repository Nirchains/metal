frappe.ui.form.on("Item", {
	onload: function(frm) {
		//Filtramos los productos de tipo "TAPA"
		frm.fields_dict['tapa'].get_query = function(doc) {
			return {
				filters: [
					['Item', 'item_group', 'in',
						'Tapas sin litografía, Tapas litografiadas']
				]
			}
		},
		//Filtramos los productos de tipo "FONDOS"
		frm.fields_dict['fondo'].get_query = function(doc) {
			return {
				filters: [
					['Item', 'item_group', '=',
						'Fondos']
				]
			}
		}

	},
	item_group: function(frm) {
		//Si seleccionamos el tipo "Productos" finales, seleccionamos algunas opciones por defecto para facilitar la inserción de datos
		if (frm.doc.item_group=='Productos') {
			frm.set_value('default_material_request_type','Manufacture');
			frm.set_value('default_warehouse','Productos terminados - MDS');
			frm.set_value('is_purchase_item',0);
			frm.set_value('is_sales_item',1);
			frm.refresh_fields();
		}
	}
})