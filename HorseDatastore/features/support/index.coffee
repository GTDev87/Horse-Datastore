Browser = require 'zombie'

Browser.site = "localhost:1337"

exports.Browser = Browser
exports.Horse = require("./helper").Horse