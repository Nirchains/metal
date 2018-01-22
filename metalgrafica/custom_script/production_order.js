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
	

})

