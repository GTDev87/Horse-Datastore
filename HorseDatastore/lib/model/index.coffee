exports.initialize = (app, config) ->
  redisDB = require("redis").createClient()
  redisDB.select(app.set('redisdb'))
  
  require("./user").initialize(redisDB)
  require("./word").initialize(redisDB)
