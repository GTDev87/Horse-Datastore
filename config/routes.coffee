define -> 
  initialize: (app) ->    
    app.get '/', (req, res) ->
      res.send 'hello world'