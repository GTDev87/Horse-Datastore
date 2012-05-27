redisDB = require("redis").createClient()
  
require("./user").initialize(redisDB)
require("./word").initialize(redisDB)