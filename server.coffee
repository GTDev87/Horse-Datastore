http = require 'http'
server = http.createServer (request, response) ->
	request.addListener 'end', ->
		response.writeHead 200, {'Content-Type': 'text/plain'}
		response.write 'Hello World!'
		response.end()
server.listen 8000
