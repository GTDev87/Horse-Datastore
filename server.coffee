http = require 'http'
mongo = require 'mongodb'

mongoClient = mongoInit("127.0.0.1",27017,"HorseDataStore")

server = http.createServer (request, response) ->
	request.addListener 'end', ->
		response.writeHead 200, {'Content-Type': 'application/json'}
		wordObject = word: "truthiness"
		response.end JSON.stringify(wordObject)
server.listen 8081


mongoInit = (serverURL,serverPort,clientName) ->
  server = new mongo.Server serverURL, serverPort, {}
  client = new mongo.Db clientName, server
  return client
