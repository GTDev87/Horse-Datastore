chai = require 'chai'
should = chai.should()
DatabaseCleaner = require "database-cleaner"
databaseCleaner = new DatabaseCleaner('redis')

App = require("../lib/app").App

databaseCleaner.clean(App.model.DB)

exports.App = App