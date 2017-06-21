// Copyright (c) 2017, Pedro Antonio Fernández Gómez and contributors
// For license information, please see license.txt

frappe.ui.form.on('Formato', {
	refresh: function(frm) {

	},
	validate: function(frm) {

	},
	//Evento selección de "Tipo de formato"
	tipo_de_formato: function(frm) {
		if (frm.doc['tipo_de_formato'] == 'Cilíndrico') {
			frm.get_docfield('diametro').reqd = true;
			frm.get_docfield('ancho').reqd = false;
			frm.get_docfield('largo').reqd = false;

		} else if (frm.doc['tipo_de_formato'] == 'Cilíndrico') {
			frm.get_docfield('diametro').reqd = false;
			frm.get_docfield('ancho').reqd = true;
			frm.get_docfield('largo').reqd = true;
		}
		frm.refresh_fields();
	},
	//Evento selección de "Es producto final"
	es_producto_final: function(frm) {
		if (frm.doc['es_producto_final'] == 1) {
			frm.get_docfield('alto').reqd = true;
		} else {
			frm.get_docfield('alto').reqd = false;
		}	
		frm.refresh_fields();
	}
});
