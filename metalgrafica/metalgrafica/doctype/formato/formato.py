# -*- coding: utf-8 -*-
# Copyright (c) 2017, Pedro Antonio Fernández Gómez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Formato(Document):
	def autoname(self):

		#Añadimos al nombre el formato y la capacidad
		formato = frappe.db.get_value('Formato denominaciones', self.formato,'abreviatura')
		name = ""
		if not self.es_producto_final:
			name = ("{0}").format(formato)

		#Añadimos la capacidad
		if self.capacidad:
			if not self.es_producto_final:
				name = ("{0}-{1}").format(name, self.capacidad)
			else:
				name = ("{0}{1}").format(name, self.capacidad)

		#Añadimos al nombre el Tipo de formato
		if self.tipo_de_formato == "Cilíndrico":
			name = ("{0}-C-{1}").format(name, self.diametro)
		else:
			name = ("{0}-R-{1}-{2}").format(name, self.largo, self.ancho)

		#Si es producto final lleva 'alto'
		if self.es_producto_final:
			name = ("{0}-{1}").format(name, self.alto)

		self.name = name

	"""Este código no es necesario ya
	def validate(self):
		if self.tipo_de_formato == "Cilíndrico":
			if not self.diametro:
				self.ancho = ""
				self.largo = ""
				frappe.throw("Debe indicar el diámetro")
		elif self.tipo_de_formato == "Rectangular":
			if not self.ancho:
				self.diametro = ""
				frappe.throw("Debe indicar el ancho")
			if not self.largo:
				frappe.throw("Debe indicar el largo")

		if self.es_producto_final:
			if not self.alto:
				frappe.throw("Debe indicar el alto")
		else:
			self.alto = ""
	"""