// Copyright (c) 2017, Pedro Antonio Fernández Gómez and contributors
// For license information, please see license.txt

frappe.ui.form.on('Formato', {
	refresh: function(frm) {
		cur_frm.cscript.if_tipo_de_formato(frm);
		cur_frm.cscript.if_es_producto_final(frm);
		frm.refresh_fields();
	},

	//Evento selección de "Tipo de formato"
	tipo_de_formato: function(frm) {
		cur_frm.cscript.if_tipo_de_formato(frm);
		frm.refresh_fields();
	},

	//Evento selección de "Es producto final"
	es_producto_final: function(frm) {
		cur_frm.cscript.if_es_producto_final(frm);
		frm.refresh_fields();
	}
});

$.extend(cur_frm.cscript, {
	if_es_producto_final: function(frm) {
		frm.toggle_display("alto", frm.doc['es_producto_final'] == 1);
		frm.toggle_reqd("alto", frm.doc['es_producto_final'] == 1);
	},

	if_tipo_de_formato: function (frm) {
		frm.toggle_display("diametro", frm.doc['tipo_de_formato'] == 'Cilíndrico');
		frm.toggle_reqd("diametro", frm.doc['tipo_de_formato'] == 'Cilíndrico');

		frm.toggle_display("ancho", frm.doc['tipo_de_formato'] == 'Rectangular');
		frm.toggle_reqd("ancho", frm.doc['tipo_de_formato'] == 'Rectangular');

		frm.toggle_display("largo", frm.doc['tipo_de_formato'] == 'Rectangular');
		frm.toggle_reqd("largo", frm.doc['tipo_de_formato'] == 'Rectangular');

	}
});