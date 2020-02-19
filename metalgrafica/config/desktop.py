# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"module_name": "Metalgrafica",
			"color": "grey",
			"icon": "octicon octicon-file-directory",
			"type": "module",
			"label": _("Metalgrafica")
		},
		{
			"module_name": "Metalgrafica Contabilidad",
			"color": "blue",
			"icon": "octicon octicon-repo",
			"type": "module",
			"label": _("Metalgrafica Contabilidad")
		}

	]
