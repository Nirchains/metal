// Copyright (c) 2018, HISPALIS DIGITAL and contributors
// For license information, please see license.txt


frappe.ui.form.on('Stock Entry', {
	setup: function(frm) {
		frm.set_query('batch_no', 'items', function(doc, cdt, cdn) {
			var item = locals[cdt][cdn];
			if(!item.item_code) {
				frappe.throw(__("Please enter Item Code to get Batch Number"));
			} else {
				if (in_list(["Material Transfer for Manufacture", "Manufacture", "Repack", "Subcontract"], doc.stock_entry_type)) {
					var mapids = frm.doc.items.map(function(d) {
									if (!helper.IsNullOrEmpty(d.batch_no)) {
										return "'" + d.batch_no + "'";
									} else {
										return null;	
									}
								}
							);
					//console.log(mapids);
					var filters = {
						'item_code': item.item_code,
						'posting_date': frm.doc.posting_date || frappe.datetime.nowdate(),
						'batch_id': ["not in", mapids]
					}
				} else {
					var filters = {
						'item_code': item.item_code
					}
				}

				if(item.s_warehouse) filters["warehouse"] = item.s_warehouse;
				//console.log(filters);
				return {
					query : "erpnext.controllers.queries.get_batch_no",
					filters: filters
				}
			}
		});
	},
	onload: function(frm) {
		if(frm.doc.docstatus < 1 && helper.IsNullOrEmpty(frm.doc.work_order)) {
			frappe.call({
				method: "metalgrafica.util.get_next_batch",
				callback: function(r) {
					if(r.message) {
						frm.set_value("inicio_de_secuencia", r.message);
					}					
				}
			});
		} else if(frm.doc.docstatus < 1 && !helper.IsNullOrEmpty(frm.doc.work_order)) {
			frm.set_value("inicio_de_secuencia", frm.doc.work_order);
		}

		if(frm.doc.__islocal) {
			/*if (frm.doc.purpose == "Manufacture") {
				frm.set_value("numero_bloques", "");
			}*/
			if (!helper.IsNullOrEmpty(frm.doc.work_order)) {
				frappe.db.get_value("Work Order",frm.doc.work_order,"planned_start_date").then((r) => {
					var planned_start_date = r.message.planned_start_date;
					frm.set_value("posting_date",planned_start_date);
					var planned_start_time = moment(planned_start_date).format("hh:mm:ss");
					frm.set_value("posting_time", planned_start_time);
					frm.set_value("set_posting_time", 1);
				});
			}
		}
	},
	generar_bloques: function(frm) {
		var item, numero_bloques;
		//Generamos los bloques
		if (!helper.ArrayIsNullOrEmpty(frm.doc.items)) {
			item = frm.doc.items[frm.doc.items.length-1];

			if (helper.IsNullOrEmpty(frm.doc.inicio_de_secuencia)) {
				cur_frm.cscript.purchase_receipt.duplicar_productos(frm, item, frm.doc.numero_bloques, null);		
			} else {
				//En caso de productos manufacturados, siempre se generará un solo bloque de salida
				if (frm.doc.stock_entry_type == "Manufacture") {
					numero_bloques = 1;
				} else {
					numero_bloques = frm.doc.numero_bloques;
				}
				cur_frm.cscript.purchase_receipt.crear_lotes(frm, item, frm.doc.inicio_de_secuencia, numero_bloques, item.item_code);
			}

		} else {
			msgprint("Antes de generar los bloques, debe introducir al menos un producto en la lista de productos recibidos");
		}
	},
	refresh: function(frm) {
		cur_frm.cscript.purchase_receipt.check_properties(frm);

		if(!frm.doc.__islocal) {
			if (frm.doc.work_order) {
				frm.add_custom_button(__("Ver orden de producción"),
					function() {
						frappe.set_route("Form", "Work Order", frm.doc.work_order);
					}
				);
			}		
		}
	},
	purpose: function(frm) {
		cur_frm.cscript.purchase_receipt.check_properties(frm);
	},
	stock_entry_type: function(frm) {
		cur_frm.cscript.purchase_receipt.check_properties(frm);
	},
	work_order: function(frm) {
		cur_frm.cscript.purchase_receipt.check_properties(frm);
		frm.set_value("inicio_de_secuencia", frm.doc.work_order);
	},
	get_batch_items: function(frm) {
		
	}
});

frappe.ui.form.on('Stock Entry Detail', {
	get_batchs: function(frm, cdt, cdn) {
		var d = locals[cdt][cdn];
		if(d.item_code) {
			d.has_batch_no = frappe.db.get_value('Item', d.item_code, 'has_batch_no')
			erpnext.stock.select_batch_and_serial_no(frm, d, true);
			
		}
	}
});


cur_frm.cscript.purchase_receipt = {
	check_properties: function (frm) {
		var bloques_section_visible = false;
		if ((frm.doc.stock_entry_type == 'Material Receipt' && frm.doc.docstatus < 1) || !helper.IsNullOrEmpty(frm.doc.work_order)) {
			bloques_section_visible = true;
		}
		frm.toggle_display('bloques_section', bloques_section_visible);
		frm.toggle_reqd("numero_bloques", bloques_section_visible);
	},

	duplicar_productos: function (frm, item, numero_bloques, lotes) {
		//Duplicamos los productos
		var d;
		//frappe.model.clear_table(frm.doc,"items");
		for (var i = 0; i < numero_bloques; i++) {

			//El primer elemento ni lo borramos ni lo duplicamos
			if (i > 0) {
				d = frm.add_child("items");
			} else {
				d = frm.doc.items[frm.doc.items.length-1];
			}

			for (var property_name in item) {

				if (!helper.In(property_name, ["idx", "docstatus", "doctype", "name", "__islocal", "owner", "parent", "parent_field", "parent_type", "batch_no"])) {
					d[property_name] = item[property_name];
	                		
				}
			}

			if (!helper.ArrayIsNullOrEmpty(lotes)) {
				if (lotes.length>i) {
					d["batch_no"] = lotes[i].id.toString();
				}
			}

			frm.refresh_field("items");
		}
	},

	crear_lotes: function(frm, item, inicio_de_secuencia, numero_bloques, item_code) {
		if (!helper.IsNullOrEmpty(inicio_de_secuencia)) {

			frappe.call({
				method: "metalgrafica.util.create_batch_secuence",
				args: {
					"inicio_de_secuencia": inicio_de_secuencia,
					"producto": item_code,
					"numero_bloques": numero_bloques
				},
				callback: function(r) {
					if(!r.message) {
						msgprint("No se han creado lotes");
					} else {
						cur_frm.cscript.purchase_receipt.duplicar_productos(frm, item, numero_bloques, r.message);	
					}					
				}
			});
		}

	}
};


erpnext.stock.select_batch_and_serial_no = (frm, item, show_dialog) => {
	let get_warehouse_type_and_name = (item) => {
		let value = '';
		if(frm.fields_dict.from_warehouse.disp_status === "Write") {
			value = cstr(item.s_warehouse) || '';
			return {
				type: 'Source Warehouse',
				name: value
			};
		} else {
			value = cstr(item.t_warehouse) || '';
			return {
				type: 'Target Warehouse',
				name: value
			};
		}
	}

	if(item && item.has_serial_no
		&& frm.doc.stock_entry_type === 'Material Receipt') {
		return;
	}

	var args = {
		'item_code'			: item.item_code,
		'work_order'	: frm.fields_dict.work_order.value || '',
		'fg_completed_qty'	: frm.fields_dict.fg_completed_qty.value || 0,
		's_warehouse'		: item.s_warehouse || "",
		't_warehouse'		: item.t_warehouse || ""
	};

	//console.log(args);

	var required_qty = 0;

	frappe.call({
		method: "metalgrafica.stock_entry.get_item_qty_required",
		args: args,
		callback: function(r) {
			if(r.message) {
				required_qty = r.message;
			}
			if (required_qty > 0) {
				frappe.require("assets/metalgrafica/js/core/serial_no_batch_selector.js", function() {
					new erpnext.SerialNoBatchSelector({
						frm: frm,
						item: item,
						warehouse_details: get_warehouse_type_and_name(item),
						required_qty: required_qty
					}, show_dialog);
				});
			}
		}
	});

}

$.extend(cur_frm.cscript, new erpnext.stock.StockEntry({frm: cur_frm}));