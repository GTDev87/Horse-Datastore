define [
  "express", 
  "connect-redis", 
  "cs!config/config", 
  "cs!config/setup", 
  "cs!config/routes", 
  "cs!src/server"],(express, ConnectRedis, config, setup, routes, server) ->
    
  RedisStore = new ConnectRedis(express)
  app = express.createServer()
  setup.initialize(app, express, RedisStore)
  routes.initialize(app)
  app.listen(config.server.port)
