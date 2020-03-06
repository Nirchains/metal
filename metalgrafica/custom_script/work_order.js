cur_frm.add_fetch("production_item", "item_group", "item_group");

frappe.ui.form.on("Work Order", {
	onload: function(frm) {
		if(frm.doc.__islocal) {
			frm.trigger('bom_no');
		}

	},

	refresh: function (frm) {
		if(!frm.doc.__islocal) {
			frm.add_custom_button(__("Transferir material"),
				function() {
					frappe.route_options = {
						"work_order": frm.doc.name,
						"stock_entry_type": "Material Transfer for Manufacture"
					};
					frappe.set_route("List", "Stock Entry");
				}
			);
			frm.add_custom_button(__("Imprimir parte de trabajo"),
				function() {
					erpnext.work_order.print_work_order(frm);
				}, __("Print"));

			frm.add_custom_button(__("Imprimir etiquetas"),
				function() {
					erpnext.work_order.print_tags(frm);
				}, __("Print"));
		}

		cur_frm.cscript.work_order.check_properties(frm);
		frm.refresh_fields();
	},
	production_item: function(frm) {
		cur_frm.cscript.work_order.check_properties(frm);
		frm.refresh_fields();
	}

});

cur_frm.cscript.work_order = {
	check_properties: function(frm) {
		//Visibilidad
		//Si son latas, se mostrara la fecha de fabricacion
		frm.toggle_display("fecha_fabricacion", (frm.doc.production_item||'').startsWith("LATA-"));
	},
	
}


erpnext.work_order["set_custom_buttons"] = function(frm) {
	var doc = frm.doc;
	if (doc.docstatus === 1) {
		if (doc.status != 'Stopped' && doc.status != 'Completed') {
			frm.add_custom_button(__('Stop'), function() {
				erpnext.work_order.stop_work_order(frm, "Stopped");
			}, __("Status"));
			frm.add_custom_button(__('Marcar como completada'), function() {
				erpnext.work_order.stop_work_order(frm, "Completed");
			}, __("Status"));
		} else if (doc.status == 'Stopped') {
			frm.add_custom_button(__('Re-open'), function() {
				erpnext.work_order.stop_work_order(frm, "Resumed");
			}, __("Status"));
		}

		if(!frm.doc.skip_transfer){
			if ((flt(doc.material_transferred_for_manufacturing) < flt(doc.qty))
				&& frm.doc.status != 'Stopped') {
				frm.has_start_btn = true;
				//var start_btn = frm.add_custom_button(__('Start'), function() {
				//	erpnext.work_order.make_se(frm, 'Material Transfer for Manufacture');
				//});
				//start_btn.addClass('btn-primary');
			}
		}

		if(!frm.doc.skip_transfer){
			if ((flt(doc.produced_qty) < flt(doc.material_transferred_for_manufacturing))
					&& frm.doc.status != 'Stopped') {
				frm.has_finish_btn = true;
				var finish_btn = frm.add_custom_button(__('Finish'), function() {
					erpnext.work_order.make_se(frm, 'Manufacture');
				});

				if(doc.material_transferred_for_manufacturing==doc.qty) {
					// all materials transferred for manufacturing, make this primary
					finish_btn.addClass('btn-primary');
				}
			}
		} else {
			if ((flt(doc.produced_qty) < flt(doc.qty)) && frm.doc.status != 'Stopped') {
				frm.has_finish_btn = true;
				var finish_btn = frm.add_custom_button(__('Finish'), function() {
					erpnext.work_order.make_se(frm, 'Manufacture');
				});
				finish_btn.addClass('btn-primary');
			}
		}
	}

}

erpnext.work_order["print_tags"] = function(frm) {
	var format;
	if (frm.doc.production_item.startsWith("LATA")) {
	 	format = "Orden de Produccion Palets";
	} else {
		format = "Orden de Produccion Etiquetas";
	}
	var with_letterhead = false;
	var lang_code = "ES";
	var printit = true;
	print.html(format,with_letterhead,lang_code,printit);
}

erpnext.work_order["print_work_order"] = function(frm) {
	var format = "Orden de produccion";
	var with_letterhead = true;
	var lang_code = "ES";
	var printit = true;
	//print.pdf(format,with_letterhead,lang_code,printit);
	print.html(format,with_letterhead,lang_code,printit);
}


