define [
  "express", 
  "cs!config/config",
  "cs!config/setup_server",
  "cs!config/routes", 
  "cs!src/server"],(express, config, setup_server, routes, server) ->
    
  app = express.createServer()
  setup_server.initialize(app)
  routes.initialize(app)
  app.listen(config.server.port)
