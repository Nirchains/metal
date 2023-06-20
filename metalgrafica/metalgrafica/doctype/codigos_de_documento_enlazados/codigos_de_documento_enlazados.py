# -*- coding: utf-8 -*-
# Copyright (c) 2023, Pedro Antonio Fernández Gómez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
# import frappe
from frappe.model.document import Document

class Codigosdedocumentoenlazados(Document):
	def autoname(self):
		#self.name = self.docname + "#" + self.code + " - " + self.version
		self.name = self.docname + "#" + self.print_format_name
