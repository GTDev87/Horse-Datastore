redisDB = {}

exports.initialize = (db) ->
  redisDB = db
  
class User
  constructor: (attributes) ->
    attributes = attributes || 0;
    @name = attributes.name || "";

exports.User = (attributes) ->
  new User(attributes)