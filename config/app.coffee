require('../node_modules/requirejs/bin/r.js')

express = require('express')
RedisStore = require('connect-redis')(express)
app = express.createServer()

config = require('./config.coffee')

require('./setup.coffee')(app, express, RedisStore)
require('./routes.coffee')(app)
require('../lib/server.coffee')

app.listen(config.server.port)