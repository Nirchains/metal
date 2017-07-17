frappe.ui.form.on("Item", {
	onload: function(frm) {
		//Filtramos los productos de tipo "TAPA"
		frm.fields_dict['tapa'].get_query = function(doc) {
			return {
				filters: [
					['Item', 'item_group', 'in', 'Tapas sin litografía, Tapas litografiadas']
				]
			}
		},
		
		//Filtramos los productos de tipo "FONDOS"
		frm.fields_dict['fondo'].get_query = function(doc) {
			return {
				filters: [
					['Item', 'item_group', '=', 'Fondos']
				]
			}
		},

		//Filtramos los productos de tipo "HOJA"
		frm.fields_dict['hoja'].get_query = function(doc) {
			return {
				filters: [
					['Item', 'item_group', '=', 'Hojas']
				]
			}
		},

		//Filtramos los productos de tipo "CUERPOS"
		frm.fields_dict['cuerpo'].get_query = function(doc) {
			return {
				filters: [
					['Item', 'item_group', '=', 'Cuerpos']
				]
			}
		},

		//Filtramos los productos de tipo "TIRAS"
		frm.fields_dict['tira'].get_query = function(doc) {
			return {
				filters: [
					['Item', 'item_group', '=', 'Tiras']
				]
			}
		},

		//Filtramos los productos de tipo "Palet"
		frm.fields_dict['palet'].get_query = function(doc) {
			return {
				filters: [
					['Item', 'item_group', '=', 'Palets']
				]
			}
		},

		//Filtramos los formatos
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

	litografia: function(frm) {
		cur_frm.cscript.item.if_item_group(frm);
		frm.refresh_fields();
	},

	formato: function(frm) {
		cur_frm.cscript.item.if_formato(frm);
		frm.refresh_fields();
	},

	hoja: function (frm) {
		cur_frm.cscript.item.set_acabado(frm);
	},

	generar_descripcion: function(frm) {
		var descripcion = {};
		var sdescripcion = "";
		var aux = '';
		if (frm.doc.item_group) {
			//aux = frappe.db.get_value("Item Group", frm.doc.item_group, "abreviatura")
			//descripcion['Abreviatura'] = aux;
			/*frappe.model.get_value("Item Group", frm.doc.item_group, "abreviatura", function(value) {
				descripcion["abreviatura"] = value.abreviatura;
				
				for(key in descripcion){
					sdescripcion += descripcion[key];
				}

				frm.set_value('description', sdescripcion);
			});*/
			
		}
		
		var keys = ['item_group', 'litografia', 'formato', 'brand', 'fondo', 'tapa', 'acabado', 'diametro', 'largo', 'ancho', 'alto', 'espesor', 'color',
					'posicion', 'panelado', 'palet', 'numero_de_capas', 'numero_envases_capa',
					'cuerpo', 'hoja', 'tira', 'asa', 'soporte_asa', 'tapon']
		doc = {}
		$.each(keys, function(index, value) {
			doc[value] = frm.doc[value];
		});

		frappe.call({
			type: "POST",
			method: "metalgrafica.util.item_name_generate",
			freeze: true,
			args: {
				"doc": doc
			},
			callback: function(r) {
				frm.set_value('description', r.message);
			}
		})


	}
})

cur_frm.cscript.item = {
	if_item_group: function(frm) {
		//Visibilidad
		frm.toggle_display("litografia", frm.doc.item_group=="Productos"
														|| frm.doc.item_group=="Tapas litografiadas"
														|| frm.doc.item_group=="Tapas"
														|| frm.doc.item_group=="Hojas"
														|| frm.doc.item_group=="Cuerpos");

		util.toggle_display_and_required(frm, "composicion", (frm.doc.item_group=="Productos"
														|| frm.doc.item_group=="Cuerpos"
														|| frm.doc.item_group=="Hojas")
														&& frm.doc.litografia == true);

		util.toggle_display_and_required(frm, "fondo", frm.doc.item_group=="Productos");

		util.toggle_display_and_required(frm, "tapa", frm.doc.item_group=="Productos");

		util.toggle_display_and_required(frm, "hoja", frm.doc.item_group=="Cuerpos"
														|| frm.doc.item_group=="Tiras");

		util.toggle_display_and_required(frm, "tira", frm.doc.item_group=="Tapas"
														|| frm.doc.item_group=="Fondos"
														|| frm.doc.item_group=="Tapas sin litografía" 
														|| frm.doc.item_group=="Tapas litografiadas");

		util.toggle_display_and_required(frm, "asa", frm.doc.item_group=="Tapas");

		util.toggle_display_and_required(frm, "soporte_asa", frm.doc.item_group=="Tapas");

		util.toggle_display_and_required(frm, "tapon", frm.doc.item_group=="Tapas");


		util.toggle_display_and_required(frm, "cuerpo", frm.doc.item_group=="Productos");

		util.toggle_display_and_required(frm, "panelado", frm.doc.item_group=="Productos");

		util.toggle_display_and_required(frm, "numero_de_capas", frm.doc.item_group=="Productos");

		util.toggle_display_and_required(frm, "numero_envases_capa", frm.doc.item_group=="Productos");

		util.toggle_display_and_required(frm, "palet", frm.doc.item_group=="Productos");

		util.toggle_display_and_required(frm, "posicion", frm.doc.item_group=="Productos");

		util.toggle_display_and_required(frm, "formato", frm.doc.item_group=="Productos" 
														|| frm.doc.item_group=="Fondos" 
														|| frm.doc.item_group=="Tapas sin litografía" 
														|| frm.doc.item_group=="Tapas litografiadas"
														|| frm.doc.item_group=="Tapas"
														|| frm.doc.item_group=="Cuerpos");

		util.toggle_display_and_required(frm, "acabado", (frm.doc.item_group=="Fondos"
														|| frm.doc.item_group=="Tapas sin litografía"
														|| frm.doc.item_group=="Hojas"
														|| frm.doc.item_group=="Tapas"
														|| frm.doc.item_group=="Cuerpos"
														|| frm.doc.item_group=="Tiras")
														&& frm.doc.litografia!=true);

		util.toggle_display_and_required(frm, "brand", (frm.doc.item_group=="Productos"
														|| frm.doc.item_group=="Tapas litografiadas"
														|| frm.doc.item_group=="Tapas"
														|| frm.doc.item_group=="Hojas"
														|| frm.doc.item_group=="Cuerpos")
														&& frm.doc.litografia==true);

		frm.toggle_enable("diametro", frm.doc.item_group=="Tapones");
		frm.toggle_reqd("diametro", frm.doc.item_group=="Tapones");
		
		util.toggle_display_and_required(frm, "color", frm.doc.item_group=="Tapones"
														|| frm.doc.item_group=="Respiradores"
														|| frm.doc.item_group=="Asas");

		util.toggle_display_and_required(frm, "espesor", frm.doc.item_group=="Hojas");

		frm.toggle_enable("largo", frm.doc.item_group=="Hojas");
		frm.toggle_reqd("largo", frm.doc.item_group=="Hojas");

		frm.toggle_enable("ancho", frm.doc.item_group=="Hojas");
		frm.toggle_reqd("ancho", frm.doc.item_group=="Hojas");


		switch (frm.doc.item_group) {

			case 'Productos':
				//Si seleccionamos el tipo "Productos" finales, seleccionamos algunas opciones por defecto para facilitar la inserción de datos
				frm.set_value('default_material_request_type','Manufacture');
				frm.set_value('default_warehouse','Productos terminados - MDS');
				frm.set_value('is_purchase_item',0);
				frm.set_value('is_sales_item',1);
				break;

			case 'Tapas litografiadas':
				frm.set_value('litografia',true);
				break;

			case 'Tapas sin litografia':
				frm.set_value('litografia',false);
				break;

			case 'Fondos', 'Cuerpos', 'Tapas litografiadas', 'Tapas sin litografia':
				frm.set_value('default_material_request_type','Manufacture');
				frm.set_value('default_warehouse','Productos semi-terminados - MDS');
				frm.set_value('is_purchase_item',0);
				frm.set_value('is_sales_item',0);
				break;

			case 'Cuerpos', 'Tiras':
				frm.set_df_property('acabado', 'read_only', 1);


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
			var formato = util.get(frm, 'Formato', frm.doc.formato,undefined,this.set_formato);
		}

	},

	set_formato: function(response,frm) {

		util.set_value_if_no_null(frm,'diametro',response.diametro);
		util.set_value_if_no_null(frm,'largo',response.largo);
		util.set_value_if_no_null(frm,'ancho',response.ancho);
		util.set_value_if_no_null(frm,'alto',response.alto);

		frm.refresh_fields();

	},

	set_acabado: function(frm) {
		if (frm.doc.item_group == 'Cuerpos' || frm.doc.item_group == 'Tiras') {
			util.get(frm, 'Item', frm.doc.hoja, undefined ,function(response,frm) {
				frm.set_value('acabado',response.acabado);
				frm.refresh_fields();
			});
		}
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