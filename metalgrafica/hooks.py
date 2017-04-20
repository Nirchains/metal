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
app_include_css = ["/assets/metalgrafica/css/material.css", "/assets/metalgrafica/css/custom.css"]
app_include_js = ["/assets/metalgrafica/js/custom.js"]

# include js, css files in header of web template
# web_include_css = "/assets/metalgrafica/css/metalgrafica.css"
# web_include_js = "/assets/metalgrafica/js/metalgrafica.js"

get_help_messages = "metalgrafica.util.get_help_messages"

#fixtures = ['Custom Field', 'Property Setter', "Print Format","Custom Script"]
fixtures=['Custom Field', 'Property Setter','Print Format','Custom Script']


doctype_js = {
    "Workstation":[
        "custom_script/workstation.js"
    ],
    "Custom Field": [
        "custom_script/custom_field.js"
    ]
}

doctype_list_js = {
	"Item": ["custom_script/item_list.js"],
    "Customer": ["custom_script/customer_list.js"]
}

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

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"metalgrafica.tasks.all"
# 	],
# 	"daily": [
# 		"metalgrafica.tasks.daily"
# 	],
# 	"hourly": [
# 		"metalgrafica.tasks.hourly"
# 	],
# 	"weekly": [
# 		"metalgrafica.tasks.weekly"
# 	]
# 	"monthly": [
# 		"metalgrafica.tasks.monthly"
# 	]
# }

# Testing
# -------

# before_tests = "metalgrafica.install.before_tests"

# Overriding Whitelisted Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "metalgrafica.event.get_events"
# }

