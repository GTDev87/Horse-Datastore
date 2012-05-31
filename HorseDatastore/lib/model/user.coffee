redisDB = {}

exports.initialize = (db) ->
  redisDB = db

userPrefix = "User"
nextUserId = "nextUserID"
nameField = "name"

class User
  constructor: (attributes) ->
    attributes = attributes || 0;
    @name = attributes.name || "";
    @_id = null
    
  save: (fn) ->
    if(@_id == null)
      redisDB.incr nextUserId, (err, id) =>
        throw err if err
        @_id = id
        @_saveId(fn)
    else
      @_saveId(fn)
      
  _saveId: (fn) ->
    redisDB.hmset "#{userPrefix}:#{@_id}", nameField, @name, (err) =>
      throw err if err
      fn(err, @_id)
    
exports.get = (id, fn) ->
  redisDB.hmget "#{userPrefix}:#{id}", nameField, (err, userData) ->
    user = new User({name: userData.toString()})
    throw err if err
    fn(err, user)
  
exports.User = (attributes) ->
  new User(attributes)
  