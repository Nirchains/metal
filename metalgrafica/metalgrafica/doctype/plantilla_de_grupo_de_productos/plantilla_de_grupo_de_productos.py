# -*- coding: utf-8 -*-
# Copyright (c) 2017, Pedro Antonio Fernández Gómez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Plantilladegrupodeproductos(Document):
	def validate(self):
		
		from erpnext.utilities.transaction_base import validate_uom_is_integer
		validate_uom_is_integer(self, "stock_uom", "qty", "BOM Item")

