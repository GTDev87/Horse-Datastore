express = require('express')

RedisStore = require('connect-redis')(express)

app = express.createServer()

app.configure( ->
  app.use(express.methodOverride())
  app.use(express.bodyParser())
  app.use(app.router)
)

app.configure('test', ->
  app.use(express.static(__dirname + '/public'))
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
  app.use(
    express.session(
      secret: "secretkey" 
      store: new RedisStore(db: "horse_datastore_test")
    )
  )
)

app.configure('production', ->
  oneYear = 31557600000
  app.use(express.static(__dirname + '/public', { maxAge: oneYear }))
  app.use(express.errorHandler())
  app.use(
    express.session(
      secret: "secretkey" 
      store: new RedisStore(db: "horse_datastore")
    )
  )
)

app.get('/', (req, res) ->
  res.send('hello world')
)

app.listen(3000)