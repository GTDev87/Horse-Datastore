redisDB = {}

exports.initialize = (db) ->
  redisDB = db
  
wordPrefix = "Word"
nameField = "name"  

class Word  
  constructor: (attributes) ->
    attributes = attributes || 0;
    @name = attributes.name || "";
  
  save: (fn) ->
    redisDB.hmset "#{wordPrefix}:#{@name}", nameField, @name, (err) ->
      throw err if err
      fn(err, @name)
    
exports.get = (name, fn) ->
  redisDB.get "#{wordPrefix}:#{name}", (err, word) ->
    throw err if err
    fn(err, word)
  
exports.Word = (attributes) ->
  new Word(attributes)