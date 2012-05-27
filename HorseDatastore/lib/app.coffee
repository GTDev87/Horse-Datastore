class App
  express = require "express"
  Resource = require('express-resource')
  ConnectRedis = "connect-redis"
  config = require "../../config"
  model = require("./model")
  
  constructor: ->
    @app = express.createServer()
    @configureServer()
    @createRoutes()
    @app.listen(config.server.port)

  configureServer: ->
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
    @app.resource("users", require("./controllers/user"))
    @app.resource("words", require("./controllers/word"))

exports.App = new App()