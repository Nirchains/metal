frappe.ui.form.on("Item", {
	onload: function(frm) {

		//Filtramos los formatos
		frm.fields_dict['formato'].get_query = function(doc) {
			if (frm.doc.item_group=='PRODUCTO') {
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
		};

		//Visibilidad de las columnas de la tabla de materiales
		frm.fields_dict.materiales.grid.toggle_reqd("rate", false);
		frm.fields_dict.materiales.grid.toggle_display("rate", false);
	},

	setup: function(frm) {
		//Evento de carga de fila en la tabla de materiales
		$(frm.wrapper).on('grid-row-render', function(e, grid_row) {
			if(in_list(['BOM Item'], grid_row.doc.doctype)) {
				cur_frm.cscript.init_row_bom_items(grid_row);
			}
		});
	},

	onload_post_render: function(frm) {
		frm.get_field("materiales").grid.set_multiple_add("item_code", "qty");
	},

	refresh: function(frm) {
		cur_frm.cscript.item.init(frm);
		cur_frm.cscript.item.if_item_group(frm);
		cur_frm.cscript.item.if_formato(frm);
		frm.refresh_fields();
	},

	item_group: function(frm) {
		cur_frm.cscript.item.if_item_group(frm);
		////meter parche de doc.__islocal
		cur_frm.cscript.item.reset(frm);
		frm.refresh_fields();
	},

	formato: function(frm) {
		cur_frm.cscript.item.if_formato(frm);
		frm.refresh_fields();
	},

	litografia: function(frm) {
		cur_frm.cscript.item.if_item_group(frm);
		frm.refresh_fields();
	},

	generar_descripcion: function(frm) {
		cur_frm.cscript.item.item_description_generate(frm);
		cur_frm.cscript.item.item_name_generate(frm);
	},

	cargar_materiales: function(frm) {
		cur_frm.cscript.item.load_bom_from_template(frm);
	}
})

//Child tables
frappe.ui.form.on('BOM Item', {

	form_render: function (frm, cdt, cdn) {
		cur_frm.cscript.init_row_bom_items(frm.open_grid_row());
		frm.refresh_fields();
	},

	item_code: function (frm, cdt, cdn) {
		var d = frappe.get_doc(cdt, cdn);

		//get: function(frm, doctype, name, filters, callback)

		if (!helper.IsNull(d.item_code)) {
			util.get(frm, 'Item', d.item_code, undefined ,function(response,frm) {
				alert(d.item_code);
				//Para heredar el formato y las dimensiones
				if ((frm.doc.item_group == 'PRODUCTO' && response.item_group == 'CUERPO')
				 || (frm.doc.item_group == 'Tapas' && response.item_group == 'TAPA SIN TERMINAR')) {
					util.set_value_if_no_null(frm,'formato',response.formato);
				}

				//Para heredar la composición, litografía, marca, acabado, etc
				if ((frm.doc.item_group == 'CUERPO' && response.item_group == 'HOJA')
				 || (frm.doc.item_group == 'PRODUCTO' && response.item_group == 'CUERPO')
				 || (frm.doc.item_group == 'TIRA' && response.item_group == 'HOJA')
				 || (frm.doc.item_group == 'TAPA SIN TERMINAR' && response.item_group == 'TIRA')
				 || (frm.doc.item_group == 'FONDO' && response.item_group == 'TIRA')) {
					util.set_value_if_no_null(frm,'litografia',response.litografia);
					util.set_value_if_no_null(frm,'composicion',response.composicion);
					util.set_value_if_no_null(frm,'brand',response.brand); //marca
					util.set_value_if_no_null(frm,'acabado',response.acabado);
					util.set_value_if_no_null(frm,'litografia',response.litografia);
					util.set_value_if_no_null(frm,'image',response.image);
				}

			});
		}
	}
});


//Funciones child tables
$.extend(cur_frm.cscript, {
	init_row_bom_items: function(grid_row) {
		//Filtramos para que solo se muestren los PRODUCTO del grupo seleccionado
		grid_row.frm.set_query("item_code", "materiales", function(doc, cdt, cdn) {
			return {
				filters: {
					item_group: grid_row.doc.item_group
				}
			};
		});
	}
});

//Funciones
cur_frm.cscript.item = {
	if_item_group: function(frm) {
		//Visibilidad
		frm.toggle_enable("litografia", frm.doc.item_group=="HOJA");

		frm.toggle_enable("acabado", (frm.doc.item_group=="HOJA" && frm.doc.litografia!=true)
									|| frm.doc.item_group=="CAJA");
		frm.toggle_reqd("acabado", frm.doc.item_group=="HOJA" && frm.doc.litografia!=true );

		util.toggle_enable_and_required(frm, "brand", frm.doc.item_group=="HOJA" && frm.doc.litografia==true);

		util.toggle_enable_and_required(frm, "composicion", frm.doc.item_group=="HOJA" && frm.doc.litografia == true);

		util.toggle_display_and_required(frm, "panelado", frm.doc.item_group=="PRODUCTO");

		util.toggle_display_and_required(frm, "numero_de_capas", frm.doc.item_group=="PRODUCTO");

		util.toggle_display_and_required(frm, "numero_envases_capa", frm.doc.item_group=="PRODUCTO");

		util.toggle_display_and_required(frm, "posicion", frm.doc.item_group=="PRODUCTO");

		util.toggle_enable_and_required(frm, "formato", frm.doc.item_group=="FONDO" 
														|| frm.doc.item_group=="TAPA SIN TERMINAR"
														|| frm.doc.item_group=="CUERPO");

		util.toggle_enable_and_required(frm, "diametro", frm.doc.item_group=="TAPON");
				
		util.toggle_display_and_required(frm, "color", frm.doc.item_group=="TAPON"
														|| frm.doc.item_group=="RESPIRADOR"
														|| frm.doc.item_group=="ASA");
		
		frm.toggle_enable("espesor", frm.doc.item_group=="HOJA" || frm.doc.item_group=="SEPARADOR");
		frm.toggle_reqd("espesor", frm.doc.item_group=="HOJA");
		
		util.toggle_enable_and_required(frm, "largo", frm.doc.item_group=="HOJA"
														|| frm.doc.item_group=="SEPARADOR");
		
		util.toggle_enable_and_required(frm, "ancho", frm.doc.item_group=="HOJA"
														|| frm.doc.item_group=="SEPARADOR");

		frm.toggle_display("formato_contenedor", frm.doc.item_group=="CAJA");

		if (frm.doc.item_group) {
			
			util.get(frm, 'Item Group', frm.doc.item_group, undefined ,function(response,frm) {
				
				switch (response.parent_item_group) {

					case 'Todos los Grupos de Artículos':
						//Si seleccionamos el tipo "PRODUCTO" finales, seleccionamos algunas opciones por defecto para facilitar la inserción de datos
						frm.set_value('default_material_request_type','Manufacture');
						frm.set_value('default_warehouse','Productos terminados - MDS');
						frm.set_value('is_purchase_item',0);
						frm.set_value('is_sales_item',1);
						break;

					case 'SUB-ENSAMBLE':
						frm.set_value('default_material_request_type','Manufacture');
						frm.set_value('default_warehouse','Productos semi-terminados - MDS');
						frm.set_value('is_purchase_item',0);
						frm.set_value('is_sales_item',0);
						break;

					case 'MATERIA PRIMA':
						frm.set_value('default_material_request_type','Purchase');
						frm.set_value('default_warehouse','Materias primas - MDS');
						frm.set_value('is_purchase_item',1);
						frm.set_value('is_sales_item',0);	

						break;

					default:
					
				}
			});
		}
	},

	if_formato: function(frm) {
		//Obtenemos las dimensiones
		if (frm.doc.formato) {
			//get: function(frm, doctype, name, filters, callback)
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
		if (frm.doc.item_group == 'CUERPO' || frm.doc.item_group == 'TIRA') {
			util.get(frm, 'Item', frm.doc.hoja, undefined ,function(response,frm) {
				frm.set_value('acabado',response.acabado);
				frm.refresh_fields();
			});
		}
	},

	load_bom_from_template: function(frm) {
		if (frm.doc["item_group"]) {
			frappe.call({
				method: "metalgrafica.bom.load_bom_from_template",
				args: {
					"item_group": frm.doc["item_group"]
				},
				callback: function(r) {
					if(!r.message) {
						frappe.throw(__("El grupo de PRODUCTO no contiene ninguna plantilla de materiales"))
					} else {
						$.each(r.message, function(i, item) {
							var d = frappe.model.add_child(frm.doc, "BOM Item", "materiales");
							d.item_group = item.item_group;
							d.qty = item.qty;
						});
					}
					refresh_field("materiales");
				}
			});
		}
	},

	item_description_generate: function(frm) {

		if (frm.doc.item_group) {
		
			var keys = ['item_group', 'litografia', 'formato', 'formato_contenedor', 'brand', 'fondo', 'tapa', 'acabado', 'diametro', 'largo', 'ancho', 'alto', 'espesor', 'color',
						'posicion', 'panelado', 'palet', 'numero_de_capas', 'numero_envases_capa']
			
			doc = {}
			$.each(keys, function(index, value) {
				doc[value] = frm.doc[value];
			});

			frappe.call({
				type: "POST",
				method: "metalgrafica.bom.item_description_generate",
				freeze: true,
				args: {
					"doc": doc
				},
				callback: function(r) {
					frm.set_value('description', r.message);
				}
			});
		}
	},

	item_name_generate: function(frm) {

		if (frm.doc.item_group) {
		
			var keys = ['item_group', 'litografia', 'formato', 'formato_contenedor', 'brand', 'fondo', 'tapa', 'acabado', 'diametro', 'largo', 'ancho', 'alto', 'espesor', 
						'color', 'color_codigo']
						//'posicion', 'panelado', 'palet', 'numero_de_capas', 'numero_envases_capa']
			
			doc = {}
			$.each(keys, function(index, value) {
				doc[value] = frm.doc[value];
			});

			frappe.call({
				type: "POST",
				method: "metalgrafica.bom.item_code_generate",
				freeze: true,
				args: {
					"doc": doc
				},
				callback: function(r) {
					frm.set_value('item_code', r.message);
				}
			});

			frappe.call({
				type: "POST",
				method: "metalgrafica.bom.item_name_generate",
				freeze: true,
				args: {
					"doc": doc
				},
				callback: function(r) {
					//frm.set_value('item_name', r.message.replace(/-/g, ' '));
					frm.set_value('item_name', r.message);
					frm.set_value('nombre_para_cliente', r.message);
				}
			});
		}
	},

	init: function(frm) {

		util.transform_zero_to_empty(frm,'diametro');
		util.transform_zero_to_empty(frm,'largo');
		util.transform_zero_to_empty(frm,'ancho');
		util.transform_zero_to_empty(frm,'alto');
		util.transform_zero_to_empty(frm,'espesor');

	},

	reset: function(frm) {
		frm.doc.diametro = '';
		frm.doc.largo = '';
		frm.doc.ancho = '';
		frm.doc.alto = '';
	}
}