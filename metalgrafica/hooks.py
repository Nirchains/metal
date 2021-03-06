# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "metalgrafica"
app_title = "Metalgrafica"
app_publisher = "Pedro Antonio Fernández Gómez"
app_description = "Metalgráfica del Sur"
app_icon = "octicon octicon-file-directory"
app_color = "grey"
app_email = "pedro@hispalisdigital.com"
app_license = "MIT"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
app_include_css = [
	"/assets/metalgrafica/css/material.css", 
	"/assets/metalgrafica/css/custom.css"
]
app_include_js = [
	"/assets/js/custom.js",
    "/assets/js/core.js",
	"/assets/js/templates.min.js"
]

# include js, css files in header of web template
# web_include_css = "/assets/metalgrafica/css/metalgrafica.css"
# web_include_js = "/assets/metalgrafica/js/metalgrafica.js"

get_help_messages = "metalgrafica.util.get_help_messages"

#fixtures = ['Custom Field', 'Property Setter', "Print Format","Custom Script"]
fixtures=['Custom Field', 'Property Setter','Print Format','Custom Script', 'Domain', 'Module Def']


doctype_js = {
    "Workstation":[
        "custom_script/workstation.js"
    ],
    "Custom Field": [
        "custom_script/custom_field.js"
    ],
    "Item": [
        "custom_script/item.js"
    ],
    "BOM": [
        "custom_script/bom.js"
    ],
    "Production Order": [
        "custom_script/production_order.js"
    ],
    "Purchase Receipt": [
        "custom_script/purchase_receipt.js"
    ],
    "Quotation": [
        "custom_script/quotation.js"
    ],
    "Sales Order": [
        "custom_script/sales_order.js"
    ],
    "Production Planning Tool": [
        "custom_script/production_planning_tool.js"
    ],
    "Timesheet": [
        "custom_script/timesheet.js"
    ],
    "Stock Entry": [
        "custom_script/stock_entry.js"
    ],
    "Delivery Note": [
        "custom_script/delivery_note.js"
    ]
}

doctype_list_js = {
	"Item": ["custom_script/item_list.js"],
    "Customer": ["custom_script/customer_list.js"],
    "Production Order": ["custom_script/production_order_list.js"],
    "BOM": ["custom_script/bom_list.js"],
    "Quotation": ["custom_script/quotation_list.js"],
    "Material Request": ["custom_script/material_request_list.js"]
}

doctype_tree_js = {
    "BOM": ["custom_script/bom_tree.js"]
}

doctype_calendar_js = {
    "Timesheet": ["custom_script/timesheet_calendar.js"],
    "Production Order": ["custom_script/production_order_calendar.js"]
}

dump_report_map = "metalgrafica.report_data_map.data_map"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Website user home page (by function)
# get_website_user_home_page = "metalgrafica.utils.get_home_page"

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "metalgrafica.install.before_install"
# after_install = "metalgrafica.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "metalgrafica.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
#	}
# }

doc_events = {
    "Product Bundle": {
        "validate": "metalgrafica.util.product_bundle_validate"
    }
}

# Scheduled Tasks
# ---------------

scheduler_events = {
# 	"all": [
# 		"metalgrafica.tasks.all"
# 	],
 	"daily": [
        "metalgrafica.util.clean_batch"
# 		"metalgrafica.tasks.daily"
 	],
#	"hourly": [
# 		"metalgrafica.tasks.hourly"
# 	]
# 	"weekly": [
# 		"metalgrafica.tasks.weekly"
# 	]
# 	"monthly": [
# 		"metalgrafica.tasks.monthly"
# 	]
}

# Testing
# -------

# before_tests = "metalgrafica.install.before_tests"

# Overriding Whitelisted Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "metalgrafica.event.get_events"
# }

default_mail_footer = """<div style="text-align: center;">
</div>"""

error_report_email = "pedro@hispalisdigital.com"