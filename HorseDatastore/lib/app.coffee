class App
  express = require "express" 
  model = require("./model")
  ConnectRedis = "connect-redis"
  config = require "../../config"
  
  constructor: () ->
    @app = express.createServer()
    @startServer()
    @createRoutes()
    @app.listen(config.server.port)
  
  startServer: ->
    
    @app.configure =>
      @app.use(express.methodOverride())
      @app.use(express.bodyParser())
      @app.use(@app.router)

    @app.configure 'test', =>
      @app.use(express.static(__dirname + '/public'))
      @app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
      @app.use(
        express.session(
          secret: config.secret
          store: new RedisStore(db: config.db.test.name)
        )
      )

    @app.configure 'production', =>
      oneYear = 31557600000
      @app.use(express.static(__dirname + '/public', { maxAge: oneYear }))
      @app.use(express.errorHandler())
      @app.use(
        express.session(
          secret: config.secret 
          store: new RedisStore(db: config.db.production.name)
        )
      )

  createRoutes: ->
    @app.get '/', (req, res) ->
      res.send 'hello world'
      
exports.App = new App()