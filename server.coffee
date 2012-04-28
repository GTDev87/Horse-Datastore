http = require 'http'
server = http.createServer (request, response) ->
	request.addListener 'end', ->
		response.writeHead 200, {'Content-Type': 'application/json'}
		wordObject = word: "truthiness"
		response.end JSON.stringify(wordObject)
server.listen 8081
