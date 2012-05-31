Browser = require 'zombie'
DatabaseCleaner = require "database-cleaner"
databaseCleaner = new DatabaseCleaner('redis')

Browser.site = "localhost:1337"

exports.Browser = Browser
exports.Horse = require("./helper").Horse