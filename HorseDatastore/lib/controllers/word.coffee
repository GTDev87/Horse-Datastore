exports.index = (req, res) ->
  res.send('words index')

exports.new = (req, res) ->
  res.send('new word')  

exports.create = (req, res) ->
  res.send('create word')  

exports.show = (req, res) ->
  res.send('show word ' + req.params.word)  

exports.edit = (req, res) ->
  res.send('edit word ' + req.params.word)  

exports.update = (req, res) ->
  res.send('update word ' + req.params.word)  

exports.destroy = (req, res) ->
  res.send('destroy word ' + req.params.word);