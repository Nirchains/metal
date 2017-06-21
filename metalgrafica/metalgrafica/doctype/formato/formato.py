# -*- coding: utf-8 -*-
# Copyright (c) 2017, Pedro Antonio Fernández Gómez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Formato(Document):
	def autoname(self):
		
		if self.tipo_de_formato == "Cilíndrico":
			name = ("C-{0}").format(self.diametro)
		else:
			name = ("R-{0}-{1}").format(self.ancho, self.largo)



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