express = require "express" 
config = require "../../config"
{routes, server} = require "./startup"
model = require("./model")

app = express.createServer()
server.initialize(app, config, express)
routes.initialize(app)
app.listen(config.server.port)