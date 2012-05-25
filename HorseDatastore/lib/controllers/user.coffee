exports.index = (req, res) ->
  res.send('users index')

exports.new = (req, res) ->
  res.send('new user')  

exports.create = (req, res) ->
  res.send('create user')  

exports.show = (req, res) ->
  res.send('show user ' + req.params.user)  

exports.edit = (req, res) ->
  res.send('edit user ' + req.params.user)  

exports.update = (req, res) ->
  res.send('update user ' + req.params.user)  

exports.destroy = (req, res) ->
  res.send('destroy user ' + req.params.user);