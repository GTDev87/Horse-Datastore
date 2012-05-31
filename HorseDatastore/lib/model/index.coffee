User = {}
Word = {}

exports.initialize = (app) ->
  redisDB = require("redis").createClient()
  redisDB.select(app.set('redisdb'))
  
  User = require("./user")
  Word = require("./word")
  
  User.initialize(redisDB)
  Word.initialize(redisDB)
  
  exports.User = User
  exports.Word = Word
  exports.DB = redisDB