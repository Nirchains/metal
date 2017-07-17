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
		},

		//Filtramos los productos de tipo "FONDOS"
		frm.fields_dict['palet'].get_query = function(doc) {
			return {
				filters: [
					['Item', 'item_group', '=',
						'Palets']
				]
			}
		},

		//Filtramos los productos de tipo "FONDOS"
		frm.fields_dict['formato'].get_query = function(doc) {
			if (frm.doc.item_group=='Productos') {
				return {
					filters: [
						['Formato', 'es_producto_final', '=', 1]
					]
				}
			} else {
				return {
					filters: [
						['Formato', 'es_producto_final', '=', 0]
					]
				}
			}
		}

	},

	refresh: function(frm) {
		cur_frm.cscript.item.inicializa(frm);
		cur_frm.cscript.item.if_item_group(frm);
		cur_frm.cscript.item.if_formato(frm);
		frm.refresh_fields();
	},

	item_group: function(frm) {
		cur_frm.cscript.item.if_item_group(frm);
		cur_frm.cscript.item.resetea(frm);
		frm.refresh_fields();
	},

	formato: function(frm) {
		cur_frm.cscript.item.if_formato(frm);
		frm.refresh_fields();
	}
})

cur_frm.cscript.item = {
	if_item_group: function(frm) {
		//Visibilidad
		util.toggle_display_and_required(frm, "tapa", frm.doc.item_group=="Productos");

		util.toggle_display_and_required(frm, "panelado", frm.doc.item_group=="Productos");

		util.toggle_display_and_required(frm, "numero_de_capas", frm.doc.item_group=="Productos");

		util.toggle_display_and_required(frm, "numero_envases_capa", frm.doc.item_group=="Productos");

		util.toggle_display_and_required(frm, "palet", frm.doc.item_group=="Productos");

		util.toggle_display_and_required(frm, "posicion", frm.doc.item_group=="Productos");

		util.toggle_display_and_required(frm, "fondo", frm.doc.item_group=="Productos");

		util.toggle_display_and_required(frm, "formato", frm.doc.item_group=="Productos" 
														|| frm.doc.item_group=="Fondos" 
														|| frm.doc.item_group=="Tapas sin litografía" 
														|| frm.doc.item_group=="Tapas litografiadas");

		util.toggle_display_and_required(frm, "acabado", frm.doc.item_group=="Fondos"
														|| frm.doc.item_group=="Tapas sin litografía");

		util.toggle_display_and_required(frm, "brand", frm.doc.item_group=="Productos"
														|| frm.doc.item_group=="Tapas litografiadas");

		frm.toggle_enable("diametro", frm.doc.item_group=="Tapones");
		frm.toggle_reqd("diametro", frm.doc.item_group=="Tapones");
		
		util.toggle_display_and_required(frm, "color", frm.doc.item_group=="Tapones"
														|| frm.doc.item_group=="Respiradores");

		switch (frm.doc.item_group) {

			case 'Productos':
				//Si seleccionamos el tipo "Productos" finales, seleccionamos algunas opciones por defecto para facilitar la inserción de datos
				frm.set_value('default_material_request_type','Manufacture');
				frm.set_value('default_warehouse','Productos terminados - MDS');
				frm.set_value('is_purchase_item',0);
				frm.set_value('is_sales_item',1);
				break;

			case 'Fondos':
				frm.set_value('default_material_request_type','Manufacture');
				frm.set_value('default_warehouse','Productos semi-terminados - MDS');
				frm.set_value('is_purchase_item',0);
				frm.set_value('is_sales_item',0);
				break;

			case 'Tapones', 'Respiradores':
				frm.set_value('default_material_request_type','Purchase');
				frm.set_value('default_warehouse','Materias primas - MDS');
				frm.set_value('is_purchase_item',1);
				frm.set_value('is_sales_item',0);	

				break;

			default:
			
		}
	},

	if_formato: function(frm) {
		
		if (frm.doc.formato) {
			var formato = util.get('Formato', frm.doc.formato,undefined,this.set_formato,frm);
		}

	},

	set_formato:function(response,frm) {

		util.set_value_if_no_null(frm,'diametro',response.diametro);
		util.set_value_if_no_null(frm,'largo',response.largo);
		util.set_value_if_no_null(frm,'ancho',response.ancho);
		util.set_value_if_no_null(frm,'alto',response.alto);

		frm.refresh_fields();

	},

	inicializa: function(frm) {

		util.transform_zero_to_empty(frm,'diametro');
		util.transform_zero_to_empty(frm,'largo');
		util.transform_zero_to_empty(frm,'ancho');
		util.transform_zero_to_empty(frm,'alto');

	},

	resetea: function(frm) {
		frm.doc.diametro = '';
		frm.doc.largo = '';
		frm.doc.ancho = '';
		frm.doc.alto = '';
	}
}