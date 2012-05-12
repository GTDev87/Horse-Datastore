express = require "express" 
config = require "../config"
setup_server = require "./setup_server"
routes = require "./routes"
server = require "./server"

app = express.createServer()
setup_server.initialize(app)
routes.initialize(app)
app.listen(config.server.port)