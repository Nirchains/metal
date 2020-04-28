
frappe.provide("erpnext.bom");

cur_frm.add_fetch("formato", "diametro", "diametro");
cur_frm.add_fetch("formato", "largo", "largo");
cur_frm.add_fetch("formato", "ancho", "ancho");
cur_frm.add_fetch("formato", "alto", "alto");
cur_frm.add_fetch("formato", "numero_de_capas", "numero_de_capas");
cur_frm.add_fetch("formato", "numero_envases_capa", "numero_envases_capa");

frappe.ui.form.on("Item", {
	onload: function(frm) {

		//El grupo no puede ser un árbol
		frm.fields_dict['item_group'].get_query = function(doc) {
			return {
				filters: [
					['Item Group', 'is_group', '=', 0]
				]
			}
		};

		//Filtramos los formatos
		frm.fields_dict['formato'].get_query = function(doc) {
			if (frm.doc.item_group=='PRODUCTO' || frm.doc.item_group=='CUERPO') {
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

		frm.set_query("plano_de_litografia", function() {
			return {
				"filters": {
					"formato": frm.doc.formato_del_cuerpo
				}
			};
		});
		
		//Ponemos el foco en el grupo de productos
		if(frm.doc.__islocal) {
			$('input[data-fieldname="item_group"]').focus();
		}

		util.show_tooltips();
	},

	onload_post_render: function(frm) {
		frm.get_field("materiales").grid.set_multiple_add("item_code", "qty");
	},

	refresh: function(frm) {
		cur_frm.cscript.item.set_display_formato(frm);
		cur_frm.cscript.item.check_properties(frm);
		frm.refresh_fields();
	},

	validate: function(frm) {
		//Validamos que en la tabla de materiales no se introduzcan números enteros para productos que lo requieran
		$.each(frm.doc["materiales"] || [], function(i, item) {
			
				frappe.call({
					method: "metalgrafica.bom.validate_uom_is_integer",
					args: {
						"uom": item.stock_uom,
						"qty": item.qty
					},
					callback: function(r) {
						if (r.message) {
							msgprint("La cantidad de material '" + item.item_code + "' debe ser un número entero");
							validated = false;
						}
						
					}
				});		
		});
		if (helper.In(frm.doc.item_group,['HOJA CUERPO','HOJA TAPA','HOJA FONDO']) && frm.doc.litografia == true && helper.IsNullOrEmpty(frm.doc.image)) {
			msgprint("Recuerde subir la imagen");
		}
	},

	item_group: function(frm) {
		cur_frm.cscript.item.check_properties(frm);
		cur_frm.cscript.item.init(frm);
		cur_frm.cscript.item.reset(frm);
		frm.refresh_fields();

	},

	formato: function(frm) {
		cur_frm.cscript.item.set_display_formato(frm);
	},

	litografia: function(frm) {
		cur_frm.cscript.item.check_properties(frm);
		frm.refresh_fields();
	},

	generar_descripcion: function(frm) {
		cur_frm.cscript.item.item_description_generate(frm);
		cur_frm.cscript.item.item_name_generate(frm);
		cur_frm.cscript.item.item_observations_generate(frm);
	},

	cargar_materiales: function(frm) {
		cur_frm.cscript.item.load_bom_materials_from_template(frm);
		cur_frm.cscript.item.load_qty_from_template(frm);
	}
})

//Child tables
frappe.ui.form.on('BOM Item Producto', {
	item_code: function (frm, cdt, cdn) {
		refresh_field("materiales");
		var d = frappe.get_doc(cdt, cdn);

		if (!helper.IsNullOrEmpty(d.item_code)) {
			//get: function(frm, doctype, name, filters, callback)
			util.get(frm, 'Item', d.item_code, undefined ,function(response,frm) {
				
				//Para heredar el formato y las dimensiones
				if ((frm.doc.item_group == 'PRODUCTO' && response.item_group == 'CUERPO')
				 || (frm.doc.item_group == 'TAPA' && response.item_group == 'TAPA SIN TERMINAR')
				 || ((frm.doc.item_group == 'HOJA TAPA' || frm.doc.item_group == 'HOJA CUERPO' || frm.doc.item_group == 'HOJA FONDO' || frm.doc.item_group == 'HOJA COMPUESTA') && response.item_group == 'HOJA VIRGEN')) {
					util.set_value_if_no_null(frm,'formato',response.formato);
					cur_frm.cscript.item.set_formato(response, frm);
					cur_frm.cscript.item.set_display_formato(frm);
				}

				//Para heredar el espesor de las hojas al crear las tiras
				if ((frm.doc.item_group == 'TIRA TAPA' && response.item_group == 'HOJA TAPA')
					|| (frm.doc.item_group == "TIRA FONDO" && response.item_group == 'HOJA FONDO')) {
					util.set_value_if_no_null(frm,'espesor',response.espesor);
				}

				//Para heredar el color del asa
				if (frm.doc.item_group == 'TAPA' && response.item_group == 'ASA') {
					util.set_value_if_no_null(frm, 'color', response.color);
					util.set_value_if_no_null(frm, 'color_codigo', response.color_codigo);
				}

				//Para heredar la composición, litografía, marca, acabado, etc
				if ((frm.doc.item_group == 'CUERPO' && response.item_group == 'HOJA CUERPO')
				 || (frm.doc.item_group == 'PRODUCTO' && response.item_group == 'CUERPO')
				 || (frm.doc.item_group == 'TAPA' && response.item_group == 'TAPA SIN TERMINAR')
				 || (frm.doc.item_group == 'TIRA TAPA' && response.item_group == 'HOJA TAPA')
				 || (frm.doc.item_group == 'TIRA FONDO' && response.item_group == 'HOJA FONDO')
				 || (frm.doc.item_group == 'TAPA SIN TERMINAR' && response.item_group == 'TIRA TAPA')
				 || (frm.doc.item_group == 'FONDO' && response.item_group == 'TIRA FONDO')) {
					util.set_value_if_no_null(frm,'litografia',response.litografia);
					util.set_value_if_no_null(frm,'composicion',response.composicion);
					util.set_value_if_no_null(frm,'brand',response.brand); //marca
					util.set_value_if_no_null(frm,'acabado',response.acabado);
					util.set_value_if_no_null(frm,'litografia',response.litografia);
					util.set_value_if_no_null(frm,'image',response.image);
				}

				if ((frm.doc.item_group == 'CUERPO' && response.item_group == 'HOJA CUERPO')) {
					util.set_value_if_no_null(frm,'formato',response.formato_del_cuerpo);
					frm.set_value('ancho',10);
					util.get(frm, 'Formato', response.formato_del_cuerpo, undefined ,function(responsef,frm) {
						cur_frm.cscript.item.set_formato(responsef, frm);
						cur_frm.cscript.item.set_display_formato(frm);
		 			});
				}

				//Hojas compuestas
				if (frm.doc.item_group == 'CORTE HOJA COMPUESTA' && response.item_group == 'HOJA COMPUESTA') {
					if (!helper.IsNullOrEmpty(response.item_code)) {

						//Generamos el código de producto
						frm.set_value("item_name",  response.item_name.replace("HOJA-CO", "CORTE-HC"));
						frm.set_value("item_code", response.item_code.replace("HOJA-CO", "CORTE-HC"));

						//Obtenemos la lista de productos de la combinación
						frappe.model.clear_table(frm.doc,"productos_de_la_combinacion");
						frappe.call({
							method: "metalgrafica.bom.load_productos_de_la_combinacion",
							args: {
								"item_code": response.item_code
							},
							callback: function(r) {
								if(!r.message) {
									//frappe.throw(__("No se encuentra la lista de combinaciones que forman el producto"))
								} else {
									frm.cscript.item.set_productos_de_la_combinacion(frm, r);
								}
							}
						});

						//Obtenemos la lista de operaciones
						/*
						frappe.model.clear_table(frm.doc,"operaciones");
						frappe.call({
							method: "metalgrafica.bom.load_operaciones_de_la_combinacion",
							args: {
								"item_code": response.item_code
							},
							callback: function(r) {
								if(!r.message) {
									//frappe.throw(__("No se encuentra la lista de combinaciones que forman el producto"))
								} else {
									i = 0;
									frm.cscript.item.set_operaciones_de_la_combinacion(frm, r);
								}
							}
						});
						*/
					}
				}

			});
		}
	}
});

//Child tables add_fetch
cur_frm.add_fetch("item_code", "description", "description");
cur_frm.add_fetch("item_code", "image", "image");
cur_frm.add_fetch("item_code", "item_name", "item_name");
cur_frm.add_fetch("item_code", "stock_uom", "uom");

cur_frm.add_fetch("operation", "description", "description");
cur_frm.add_fetch("operation", "workstation", "workstation");

cur_frm.add_fetch("item_code", "brand", "brand");
cur_frm.add_fetch("item_code", "composicion", "composicion");

cur_frm.cscript.image = function() {
	refresh_field("image_view");
}


//Para refrescar la los productos en la tabla hija de materiales, en función del grupo de producto
cur_frm.set_query("item_code", "materiales", function(doc, cdt, cdn) {
	var d = locals[cdt][cdn];
	return {
		filters: {
			item_group: d.item_group
		}
	};
});

cur_frm.set_query("item_group", "materiales", function(doc, cdt, cdn) {
	var d = locals[cdt][cdn];
	return {
		filters: {
			is_group: 0
		}
	};
});

//Funciones
cur_frm.cscript.item = {
	check_properties: function(frm) {
		//Visibilidad
		frm.toggle_enable("litografia", helper.In(frm.doc.item_group,["HOJA CUERPO","HOJA TAPA","HOJA FONDO"]));

		frm.toggle_enable("acabado", (helper.In(frm.doc.item_group,["HOJA CUERPO","HOJA TAPA","HOJA FONDO"]) && frm.doc.litografia!=true) || frm.doc.item_group=="CAJA");

		frm.toggle_reqd("acabado", helper.In(frm.doc.item_group,["HOJA CUERPO","HOJA TAPA","HOJA FONDO"]) && frm.doc.litografia!=true);

		util.toggle_enable_and_required(frm, "brand", helper.In(frm.doc.item_group,["HOJA CUERPO","HOJA TAPA",,"HOJA FONDO"]) && frm.doc.litografia==true);

		util.toggle_enable_and_required(frm, "composicion", helper.In(frm.doc.item_group,["HOJA CUERPO","HOJA TAPA","HOJA FONDO"]) && frm.doc.litografia == true);

		util.toggle_display_and_required(frm, "panelado", frm.doc.item_group=="PRODUCTO");

		util.toggle_display_and_required(frm, "posicion", frm.doc.item_group=="PRODUCTO");

		util.toggle_enable_and_required(frm, "formato", helper.In(frm.doc.item_group,["FONDO","TAPA SIN TERMINAR","CUERPO"]));

		util.toggle_enable_and_required(frm, "diametro", frm.doc.item_group=="TAPON");

		//COLOR						
		frm.toggle_display("color", helper.In(frm.doc.item_group,["TAPON","RESPIRADOR","ASA","TAPA"]));

		frm.toggle_reqd("color", helper.In(frm.doc.item_group,["TAPON","RESPIRADOR","ASA"]));

		frm.toggle_enable("color", helper.In(frm.doc.item_group,["TAPON","RESPIRADOR","ASA"]));
		//ESPESOR
		frm.toggle_enable("espesor", helper.In(frm.doc.item_group, ["HOJA VIRGEN","HOJA CUERPO","HOJA TAPA","HOJA FONDO","HOJA COMPUESTA","SEPARADOR"]));


		frm.toggle_reqd("espesor", helper.In(frm.doc.item_group, ["HOJA VIRGEN","HOJA CUERPO","HOJA TAPA","HOJA FONDO"]));
		
		//LARGO
		util.toggle_enable_and_required(frm, "largo", helper.In(frm.doc.item_group, ["HOJA VIRGEN","HOJA CUERPO","HOJA TAPA","HOJA FONDO", "HOJA COMPUESTA","TIRA TAPA","TIRA FONDO","SEPARADOR","PALET"]));
		
		//ANCHO
		util.toggle_enable_and_required(frm, "ancho", helper.In(frm.doc.item_group, ["HOJA VIRGEN","HOJA CUERPO","HOJA TAPA","HOJA FONDO", "HOJA COMPUESTA","TIRA TAPA","TIRA FONDO","SEPARADOR","PALET"]));
	
		util.toggle_enable_and_required(frm, "formato_del_cuerpo", frm.doc.item_group=="HOJA CUERPO");

		frm.toggle_display("formato_contenedor", frm.doc.item_group=="CAJA");

		frm.toggle_enable("plano_de_litografia", helper.In(frm.doc.item_group, ["HOJA CUERPO", "HOJA COMPUESTA", "HOJA TAPA"]));

		frm.toggle_display("salto_productos_combinacion", helper.In(frm.doc.item_group, ["HOJA COMPUESTA", "CORTE HOJA COMPUESTA"]));

		frm.toggle_display("generar_descripcion",frm.doc.item_group!="CORTE HOJA COMPUESTA");

		if (frm.doc.item_group) {
			frappe.call({
				method: "metalgrafica.bom.item_has_template",
				args: {
					"item_group": frm.doc.item_group
				},
				callback: function(r) {
					frm.toggle_display("materiales_seccion", r.message);
					frm.toggle_display("operaciones_seccion", r.message);
					frm.toggle_display("salto_sec_nombre_desc_cliente", r.message);
				}
			});
		}
	},

	init: function(frm) {
		if (frm.doc.item_group) {

			//Agregamos características propias al grupo de producto
			util.get(frm, 'Item Group', frm.doc.item_group, undefined ,function(response,frm) {
				
				switch (response.parent_item_group) {

					case 'Todos los Grupos de Artículos':
						//Si seleccionamos el tipo "PRODUCTO" finales, seleccionamos algunas opciones por defecto para facilitar la inserción de datos
						frm.set_value('default_material_request_type','Manufacture');
						cur_frm.cscript.item.load_default_warehouse(frm, 'Materias primas - MDS');
						frm.set_value('is_purchase_item',0);
						frm.set_value('is_sales_item',1);
						frm.set_value('has_batch_no',1);
						frm.set_value('create_new_batch',1);					
						break;

					case 'OPERACION':
						frm.set_value('default_material_request_type','Manufacture');
						cur_frm.cscript.item.load_default_warehouse(frm, 'Ficticio - MDS');
						frm.set_value('is_purchase_item',0);
						frm.set_value('is_sales_item',0);
						frm.set_value('has_batch_no',0);
						frm.set_value('create_new_batch',0);
						break;

					case 'SUB-ENSAMBLE':
					case 'TIRA':
						frm.set_value('default_material_request_type','Manufacture');
						cur_frm.cscript.item.load_default_warehouse(frm, 'Materias primas - MDS');
						frm.set_value('is_purchase_item',0);
						frm.set_value('is_sales_item',0);
						frm.set_value('has_batch_no',1);
						frm.set_value('create_new_batch',1);
						break;

					case 'HOJA':
						frm.set_value('default_material_request_type','Purchase');
						cur_frm.cscript.item.load_default_warehouse(frm, 'Materias primas - MDS');
						frm.set_value('is_purchase_item',1);
						frm.set_value('is_sales_item',0);
						frm.set_value('is_sub_contracted_item', 1);
						frm.set_value('has_batch_no',1);
						frm.set_value('create_new_batch',0);
						break;

					case 'MATERIA PRIMA':
					case 'CONSUMIBLE':
						frm.set_value('default_material_request_type','Purchase');
						if (frm.doc.item_group == 'HOJA VIRGEN') {
							cur_frm.cscript.item.load_default_warehouse(frm, 'LITALSA - MDS');
							frm.set_value('purchase_uom','Kilogramo')
						} else {
							cur_frm.cscript.item.load_default_warehouse(frm, 'Materias primas - MDS');
						}
						frm.set_value('is_purchase_item',1);
						frm.set_value('is_sales_item',0);
						frm.set_value('has_batch_no',1);
						frm.set_value('create_new_batch',0);
						break;

					default:
						frm.set_value('has_batch_no',1);
						frm.set_value('create_new_batch',0);
						cur_frm.cscript.item.load_default_warehouse(frm, 'Materias primas - MDS');
						break;
				}
			});
		}
	},

	load_default_warehouse: function(frm, default_warehouse) {
		/*var d = frappe.model.add_child(frm.doc, "Item Defaut", "item_defaults");
		frappe.model.set_value(d.doctype, d.name, "company", "Metalgráfica del Sur");
		frappe.model.set_value(d.doctype, d.name, "default_warehouse", default_warehouse);
		refresh_field("item_defaults");*/

	},

	load_bom_materials_from_template: function(frm) {
		if (frm.doc["item_group"]) {
			frappe.model.clear_table(frm.doc,"materiales");
			frappe.call({
				method: "metalgrafica.bom.load_bom_materials_from_template",
				args: {
					"item_group": frm.doc["item_group"]
				},
				callback: function(r) {
					if(!r.message) {
						frappe.throw(__("El grupo de PRODUCTO no contiene ninguna plantilla de materiales"))
					} else {
						$.each(r.message, function(i, item) {
							var d = frappe.model.add_child(frm.doc, "BOM Item Producto", "materiales");
							frappe.model.set_value(d.doctype, d.name, "item_group", item.item_group);
							frappe.model.set_value(d.doctype, d.name, "qty", item.qty);
							frappe.model.set_value(d.doctype, d.name, "scrap", 0);
							refresh_field("materiales");
						});
					}
				}
			});
		}
	},

	load_qty_from_template: function(frm) {
		if (frm.doc["item_group"]) {
			frappe.call({
				method: "metalgrafica.bom.load_qty_from_template",
				args: {
					"item_group": frm.doc["item_group"]
				},
				callback: function(r) {
					frm.doc.quantity = r.message;
					refresh_field("quantity");
				}
			});
		}
	},

	//GENERACIÓN DE LA DESCRIPCIÓN DEL PRODUCTO
	item_description_generate: function(frm) {

		if (frm.doc.item_group) {
		
			var keys = ['item_group', 'litografia', 'composicion', 'acabado', 'formato', 'formato_del_cuerpo', 'formato_contenedor', 'brand', 'fondo', 'tapa', 'diametro', 'largo', 'ancho', 'alto', 'espesor', 'color',
						'posicion', 'panelado', 'palet', 'numero_de_capas', 'numero_envases_capa', 'plano_de_litografia']
			
			var doc = {};

			$.each(keys, function(index, value) {
				if (!helper.IsNullOrEmpty(frm.doc[value])) {
					doc[value] = frm.doc[value];
				}
			});

			//COMPROBAMOS SI TIENE RESPIRADOR
			$.each(frm.doc.materiales || [], function(i, v) {
				if (v.item_group == "RESPIRADOR" && !helper.IsNullOrEmpty(v.item_code)) {
					doc['respirador'] = v.item_name.replace("RESPIRADOR ", "");
				}
			});

			frappe.call({
				type: "POST",
				method: "metalgrafica.bom.item_description_generate",
				freeze: true,
				args: {
					"doc": doc
				},
				callback: function(r) {
					var composicion = "";
					var descripcion = r.message;

					//Completamos con los productos de la combinación
					if (frm.doc.item_group == "HOJA COMPUESTA") {
						$.each(frm.doc.productos_de_la_combinacion || [], function(i, v) {
							composicion = composicion + "- " + v.item_name + "<br>";
						});
					}



					if (composicion != "") {
						descripcion = descripcion + "<br><b>PRODUCTOS DE LA COMBINACION:</b><br>";
						descripcion = descripcion + composicion;
					}

					frm.set_value('description', descripcion);
				}
			});
		}
	},

	item_observations_generate: function(frm) {

		if (frm.doc.item_group) {
		
			var keys = ['posicion', 'panelado', 'palet', 'plano_de_litografia']
			
			var doc = {};

			$.each(keys, function(index, value) {
				if (!helper.IsNullOrEmpty(frm.doc[value])) {
					doc[value] = frm.doc[value];
				}
			});

			//COMPROBAMOS SI TIENE RESPIRADOR
			$.each(frm.doc.materiales || [], function(i, v) {
				if (v.item_group == "RESPIRADOR" && !helper.IsNullOrEmpty(v.item_code)) {
					doc['respirador'] = v.item_name.replace("RESPIRADOR ", "");
				}
			})

			if (frm.doc.item_group == "HOJA COMPUESTA") {
				var nombre_personalizado = "";
				$.each(frm.doc.productos_de_la_combinacion, function(index, value) {
					if (!helper.IsNullOrEmpty(value["stock_qty"])) {
						nombre_personalizado = nombre_personalizado + "/" + value["stock_qty"];
					}
					if (!helper.IsNullOrEmpty(value["brand"])) {
						nombre_personalizado = nombre_personalizado + "-" + value["brand"];
					}
					if (!helper.IsNullOrEmpty(value["composicion"])) {
						nombre_personalizado = nombre_personalizado + "-" + value["composicion"];
					}
				});	
				doc['nombre_personalizado'] = nombre_personalizado;			
			}
			
			if (!helper.IsNullOrEmpty(frm.doc['numero_de_capas']) && !helper.IsNullOrEmpty(frm.doc['numero_envases_capa'])) {
				doc['unidades_palet'] = frm.doc['numero_de_capas'] * frm.doc['numero_envases_capa'];
			}

			frappe.call({
				type: "POST",
				method: "metalgrafica.bom.item_observations_generate",
				freeze: true,
				args: {
					"doc": doc
				},
				callback: function(r) {
					frm.set_value('observaciones', r.message);
				}
			});
		}
	},

	//GENERACIÓN DEL CÓDIGO Y EL NOMBRE DEL PRODUCTO
	item_name_generate: function(frm) {

		if (frm.doc.item_group) {
		
			var keys = ['item_group', 'litografia', 'formato', 'formato_del_cuerpo', 'formato_contenedor', 'brand', 'acabado', 'composicion', 'fondo', 'tapa', 'acabado', 'diametro', 'largo', 'ancho', 'alto', 'espesor', 
						'color', 'color_codigo']
						//'posicion', 'panelado', 'palet', 'numero_de_capas', 'numero_envases_capa', 'plano_de_litografia']
			
			var doc = {};
			$.each(keys, function(index, value) {
				if (!helper.IsNullOrEmpty(frm.doc[value])) {
					doc[value] = frm.doc[value];
				}
			});

			//COMPROBAMOS SI TIENE RESPIRADOR
			$.each(frm.doc.materiales || [], function(i, v) {
				if (v.item_group == "RESPIRADOR" && !helper.IsNullOrEmpty(v.item_code)) {
					doc['respirador'] = 'RES';
				}
			})

			if (frm.doc.item_group == "HOJA COMPUESTA") {
				var nombre_personalizado = "";
				$.each(frm.doc.productos_de_la_combinacion, function(index, value) {
					if (!helper.IsNullOrEmpty(value["stock_qty"])) {
						nombre_personalizado = nombre_personalizado + "/" + value["stock_qty"];
					}
					if (!helper.IsNullOrEmpty(value["brand"])) {
						nombre_personalizado = nombre_personalizado + "-" + value["brand"];
					}
					if (!helper.IsNullOrEmpty(value["composicion"])) {
						nombre_personalizado = nombre_personalizado + "-" + value["composicion"];
					}
				});	
				doc['nombre_personalizado'] = nombre_personalizado;			
			}

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

	set_productos_de_la_combinacion: function(frm, r) {
		$.each(r.message, function(i, item) {
			var d = frappe.model.add_child(frm.doc, "Productos de la combinacion", "productos_de_la_combinacion");
			frappe.model.set_value(d.doctype, d.name, "item_code", item.item_code);
			frappe.model.set_value(d.doctype, d.name, "item_name", item.item_name);
			frappe.model.set_value(d.doctype, d.name, "stock_qty", item.stock_qty);
			frappe.model.set_value(d.doctype, d.name, "stock_uom", item.stock_uom);
			refresh_field("productos_de_la_combinacion");
		});
	},

	set_operaciones_de_la_combinacion: function(frm, r) {
		$.each(r.message, function(item) {
			var d = frappe.model.add_child(frm.doc, "BOM Operation Producto", "operaciones");
			frappe.model.set_value(d.doctype, d.name, "operation", item.operation);
			frappe.model.set_value(d.doctype, d.name, "workstation", item.workstation);
			frappe.model.set_value(d.doctype, d.name, "description", item.description);
			refresh_field("operaciones");
		});
	},

	set_formato: function(response,frm) {
		util.set_value_if_no_null(frm,'diametro',response.diametro);
		util.set_value_if_no_null(frm,'largo',response.largo);
		util.set_value_if_no_null(frm,'ancho',response.ancho);
		util.set_value_if_no_null(frm,'alto',response.alto);
		util.set_value_if_no_null(frm,'espesor',response.espesor);

		util.set_value_if_no_null(frm,'numero_de_capas',response.numero_de_capas);
		util.set_value_if_no_null(frm,'numero_envases_capa',response.numero_envases_capa);

		frm.refresh_fields();
	},

	set_display_formato: function(frm) {
		if (frm.doc.diametro == 0) {
			frm.set_value("diametro", "");
		}
		if (frm.doc.espesor == 0) {
			frm.set_value("espesor", "");
		}
		if (frm.doc.largo == 0) {
			frm.set_value("largo", "");
		}
		if (frm.doc.ancho == 0) {
			frm.set_value("ancho", "");
		}
		if (frm.doc.alto == 0) {
			frm.set_value("alto", "");
		}
		if (frm.doc.numero_de_capas == 0) {
			frm.set_value("numero_de_capas", "");
		}
		if (frm.doc.numero_envases_capa == 0) {
			frm.set_value("numero_envases_capa", "");
		}
		/*
		frm.toggle_display("diametro", frm.doc.diametro != 0);
		frm.toggle_display("espesor", frm.doc.espesor != 0);
		frm.toggle_display("largo", frm.doc.largo != 0);
		frm.toggle_display("ancho", frm.doc.ancho != 0);
		frm.toggle_display("alto", frm.doc.alto != 0);
		frm.toggle_display("numero_de_capas", frm.doc.numero_de_capas != 0);
		frm.toggle_display("numero_envases_capa", frm.doc.numero_envases_capa != 0)
		*/
	},

	reset: function(frm) {
		frm.doc.formato = '';
		
		frm.doc.diametro = '';
		frm.doc.largo = '';
		frm.doc.ancho = '';
		frm.doc.alto = '';
		frm.doc.espesor = '';

		frm.doc.numero_de_capas = '';
		frm.doc.numero_envases_capa = '';

	}
}