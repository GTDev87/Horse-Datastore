express = require('express')
RedisStore = require('connect-redis')(express)
app = express.createServer()

require('./setup.coffee')(app, express, RedisStore)
require('./routes.coffee')(app)
require('../lib/server.coffee')

app.listen(3000)