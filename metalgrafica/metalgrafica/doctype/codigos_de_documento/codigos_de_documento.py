# -*- coding: utf-8 -*-
# Copyright (c) 2023, Pedro Antonio Fernández Gómez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.model.utils import set_default

class Codigosdedocumento(Document):
	
	def autoname(self):
		self.name = self.code + " - " + self.version

	def on_submit(self):
		pass
		#self.manage_default()

	def on_cancel(self):
		frappe.db.set(self, "is_default", 0)

		#self.manage_default()

	def manage_default(self):
		""" Uncheck others if current one is selected as default or
			check the current one as default if it the only bom for the selected item,
			update default bom in item master
		"""
		if self.is_default:
			set_default(self, "docname")
		elif not frappe.db.exists(dict(doctype='Codigos de documento', docstatus=1, docname=self.docname, is_default=1)):
			frappe.db.set(self, "is_default", 1)
		else:
			frappe.db.set(self, "is_default", 0)