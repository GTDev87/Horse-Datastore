express = require('express')
RedisStore = require('connect-redis')(express)
app = express.createServer()

require('../config/environment.coffee')(app, express, RedisStore)
require('../config/routes.coffee')(app)

app.listen(3000)