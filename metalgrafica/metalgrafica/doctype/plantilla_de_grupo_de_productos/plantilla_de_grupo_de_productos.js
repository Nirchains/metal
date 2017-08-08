// Copyright (c) 2017, Pedro Antonio Fernández Gómez and contributors
// For license information, please see license.txt

frappe.ui.form.on('Plantilla de grupo de productos', {
	refresh: function(frm) {
		
	},
	setup: function(frm) {
		//Evento de carga de fila en la tabla de materiales
		$(frm.wrapper).on('grid-row-render', function(e, grid_row) {
			if(in_list(['BOM Item'], grid_row.doc.doctype)) {
				cur_frm.cscript.inicializa_fila_materiales(grid_row);
			}
		});
	}
});

frappe.ui.form.on('BOM Item', {
	form_render: function (frm, cdt, cdn) {
		//cur_frm.cscript.curriculum_formacion_reglada.check_course_province(frm, cdt, cdn);
		cur_frm.cscript.inicializa_fila_materiales(frm.open_grid_row());
		frm.refresh_fields();
	}
});


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