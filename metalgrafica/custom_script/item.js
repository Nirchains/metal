frappe.ui.form.on("Item", {
	onload: function(frm) {

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

	setup: function(frm) {
		//Evento de carga de fila en la tabla de materiales
		$(frm.wrapper).on('grid-row-render', function(e, grid_row) {
			if(in_list(['BOM Item'], grid_row.doc.doctype)) {
				cur_frm.cscript.inicializa_fila_materiales(grid_row);
			}
		});
	},

	onload_post_render: function(frm) {
		frm.get_field("materiales").grid.set_multiple_add("item_code", "qty");
	},

	refresh: function(frm) {
		cur_frm.cscript.item.inicializa(frm);
		cur_frm.cscript.item.if_item_group(frm);
		cur_frm.cscript.item.if_formato(frm);
		frm.refresh_fields();
	},

	item_group: function(frm) {
		cur_frm.cscript.item.if_item_group(frm);
		////meter parche de doc.__islocal
		cur_frm.cscript.item.resetea(frm);
		frm.refresh_fields();
	},

	litografia: function(frm) {
		cur_frm.cscript.item.if_item_group(frm);
		frm.refresh_fields();
	},

	no_lleva_tapa: function(frm) {
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
		cur_frm.cscript.item.generar_descripcion(frm);
		cur_frm.cscript.item.generar_nombre(frm);
	},

	cargar_materiales: function(frm) {
		cur_frm.cscript.item.cargar_materiales_desde_plantilla(frm);
	}
})

//Child tables
frappe.ui.form.on('BOM Item', {

	form_render: function (frm, cdt, cdn) {
		cur_frm.cscript.inicializa_fila_materiales(frm.open_grid_row());
		frm.refresh_fields();
	},

	item_code: function (frm, cdt, cdn) {
		var d = frappe.get_doc(cdt, cdn);

		//get: function(frm, doctype, name, filters, callback)
		util.get(frm, 'Item', d.item_code, undefined ,function(response,frm) {
			
			//Para heredar el formato y las dimensiones
			if ((frm.doc.item_group == 'Productos' && response.item_group == 'Cuerpos')
			 || (frm.doc.item_group == 'Tapas' && response.item_group == 'Tapas sin terminar')) {
				util.set_value_only_if_no_null(frm,'formato',response.formato);
			}

			//Para heredar la composición, litografía, marca, acabado, etc
			if ((frm.doc.item_group == 'Cuerpos' && response.item_group == 'Hojas')
			 || (frm.doc.item_group == 'Productos' && response.item_group == 'Cuerpos')
			 || (frm.doc.item_group == 'Tiras' && response.item_group == 'Hojas')
			 || (frm.doc.item_group == 'Tapas sin terminar' && response.item_group == 'Tiras')
			 || (frm.doc.item_group == 'Fondos' && response.item_group == 'Tiras')) {
				util.set_value_only_if_no_null(frm,'litografia',response.litografia);
				util.set_value_only_if_no_null(frm,'composicion',response.composicion);
				util.set_value_only_if_no_null(frm,'brand',response.brand); //marca
				util.set_value_only_if_no_null(frm,'acabado',response.acabado);
				util.set_value_only_if_no_null(frm,'litografia',response.litografia);
			}

		});

	}
});


//Funciones child tables
$.extend(cur_frm.cscript, {
	inicializa_fila_materiales: function(grid_row) {
		//Filtramos para que solo se muestren los productos del grupo seleccionado
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
		frm.toggle_enable("litografia", frm.doc.item_group=="Hojas");

		util.toggle_enable_and_required(frm, "acabado", frm.doc.item_group=="Hojas" && frm.doc.litografia!=true);

		util.toggle_enable_and_required(frm, "brand", frm.doc.item_group=="Hojas" && frm.doc.litografia==true);

		util.toggle_enable_and_required(frm, "composicion", frm.doc.item_group=="Hojas" && frm.doc.litografia == true);

		util.toggle_display_and_required(frm, "panelado", frm.doc.item_group=="Productos");

		util.toggle_display_and_required(frm, "numero_de_capas", frm.doc.item_group=="Productos");

		util.toggle_display_and_required(frm, "numero_envases_capa", frm.doc.item_group=="Productos");

		util.toggle_display_and_required(frm, "posicion", frm.doc.item_group=="Productos");

		util.toggle_enable_and_required(frm, "formato", frm.doc.item_group=="Fondos" 
														|| frm.doc.item_group=="Tapas sin terminar"
														|| frm.doc.item_group=="Cuerpos");

		util.toggle_enable_and_required(frm, "diametro", frm.doc.item_group=="Tapones");
				
		util.toggle_display_and_required(frm, "color", frm.doc.item_group=="Tapones"
														|| frm.doc.item_group=="Respiradores"
														|| frm.doc.item_group=="Asas");
		
		util.toggle_enable_and_required(frm, "espesor", frm.doc.item_group=="Hojas");
		
		util.toggle_enable_and_required(frm, "largo", frm.doc.item_group=="Hojas");
		
		util.toggle_enable_and_required(frm, "ancho", frm.doc.item_group=="Hojas");

		if (frm.doc.item_group) {
			
			util.get(frm, 'Item Group', frm.doc.item_group, undefined ,function(response,frm) {
				
				switch (response.parent_item_group) {

					case 'Todos los Grupos de Artículos':
						//Si seleccionamos el tipo "Productos" finales, seleccionamos algunas opciones por defecto para facilitar la inserción de datos
						frm.set_value('default_material_request_type','Manufacture');
						frm.set_value('default_warehouse','Productos terminados - MDS');
						frm.set_value('is_purchase_item',0);
						frm.set_value('is_sales_item',1);
						break;

					case 'Sub-Ensamblajes':
						frm.set_value('default_material_request_type','Manufacture');
						frm.set_value('default_warehouse','Productos semi-terminados - MDS');
						frm.set_value('is_purchase_item',0);
						frm.set_value('is_sales_item',0);
						break;

					case 'Materia prima':
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
		if (frm.doc.item_group == 'Cuerpos' || frm.doc.item_group == 'Tiras') {
			util.get(frm, 'Item', frm.doc.hoja, undefined ,function(response,frm) {
				frm.set_value('acabado',response.acabado);
				frm.refresh_fields();
			});
		}
	},

	cargar_materiales_desde_plantilla: function(frm) {
		if (frm.doc["item_group"]) {
			frappe.call({
				method: "metalgrafica.util.cargar_materiales_desde_plantilla",
				args: {
					"item_group": frm.doc["item_group"]
				},
				callback: function(r) {
					if(!r.message) {
						frappe.throw(__("El grupo de productos no contiene ninguna plantilla de materiales"))
					} else {
						console.log(r.message);
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

	generar_descripcion: function(frm) {

		if (frm.doc.item_group) {
		
			var keys = ['item_group', 'litografia', 'formato', 'brand', 'fondo', 'tapa', 'acabado', 'diametro', 'largo', 'ancho', 'alto', 'espesor', 'color',
						'posicion', 'panelado', 'palet', 'numero_de_capas', 'numero_envases_capa']
			
			doc = {}
			$.each(keys, function(index, value) {
				doc[value] = frm.doc[value];
			});

			frappe.call({
				type: "POST",
				method: "metalgrafica.util.item_description_generate",
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

	generar_nombre: function(frm) {

		if (frm.doc.item_group) {
		
			var keys = ['item_group', 'litografia', 'formato', 'brand', 'fondo', 'tapa', 'acabado', 'diametro', 'largo', 'ancho', 'alto', 'espesor', 'color',
						'posicion', 'panelado', 'palet', 'numero_de_capas', 'numero_envases_capa']
			
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
					frm.set_value('item_code', r.message);
					frm.set_value('item_name', r.message.replace(/-/g, ' '));
				}
			});
		}
	},

	inicializa: function(frm) {

		util.transform_zero_to_empty(frm,'diametro');
		util.transform_zero_to_empty(frm,'largo');
		util.transform_zero_to_empty(frm,'ancho');
		util.transform_zero_to_empty(frm,'alto');
		util.transform_zero_to_empty(frm,'espesor');

	},

	resetea: function(frm) {
		frm.doc.diametro = '';
		frm.doc.largo = '';
		frm.doc.ancho = '';
		frm.doc.alto = '';
	}
}