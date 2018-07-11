cur_frm.add_fetch("production_item", "item_group", "item_group");

frappe.ui.form.on("Production Order", {
	onload: function(frm) {
		//Filtramos los productos de tipo "TAPA"
		frm.fields_dict['operario'].get_query = function(doc) {
			return {
				filters: [
					['Employee', 'status', '=','Active']
				]
			}
		},

		//Eliminamos el 'label' del campo Nombre del operario
		frm.get_field('nombre_operario').toggle_label(false);
		frm.refresh_fields();

		if(frm.doc.__islocal) {
			frm.trigger('bom_no');
		}

	},

	refresh: function (frm) {
		if(!frm.doc.__islocal) {
			frm.add_custom_button(__("Transferir material"),
				function() {
					frappe.route_options = {
						"production_order": frm.doc.name,
						"purpose": "Material Transfer for Manufacture"
					};
					frappe.set_route("List", "Stock Entry");
				}
			);
		}
	},

	operario: function(frm) {
		
	}
	

});


erpnext.production_order["set_custom_buttons"] = function(frm) {
	var doc = frm.doc;
	if (doc.docstatus === 1) {
		if (doc.status != 'Stopped' && doc.status != 'Completed') {
			frm.add_custom_button(__('Stop'), function() {
				erpnext.production_order.stop_production_order(frm, "Stopped");
			}, __("Status"));
		} else if (doc.status == 'Stopped') {
			frm.add_custom_button(__('Re-open'), function() {
				erpnext.production_order.stop_production_order(frm, "Resumed");
			}, __("Status"));
		}

		if(!frm.doc.skip_transfer){
			if ((flt(doc.material_transferred_for_manufacturing) < flt(doc.qty))
				&& frm.doc.status != 'Stopped') {
				frm.has_start_btn = true;
				//var start_btn = frm.add_custom_button(__('Start'), function() {
				//	erpnext.production_order.make_se(frm, 'Material Transfer for Manufacture');
				//});
				//start_btn.addClass('btn-primary');
			}
		}

		if(!frm.doc.skip_transfer){
			if ((flt(doc.produced_qty) < flt(doc.material_transferred_for_manufacturing))
					&& frm.doc.status != 'Stopped') {
				frm.has_finish_btn = true;
				var finish_btn = frm.add_custom_button(__('Finish'), function() {
					erpnext.production_order.make_se(frm, 'Manufacture');
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
					erpnext.production_order.make_se(frm, 'Manufacture');
				});
				finish_btn.addClass('btn-primary');
			}
		}
	}

}


