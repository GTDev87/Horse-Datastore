redisDB = {}

exports.initialize = (db) ->
  redisDb = db
  
class Word  
  constructor: (attributes) ->
    attributes = attributes || 0;
    @name = attributes.name || "";
    
    
exports.Word = new Word()