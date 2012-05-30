require ("../helper")

describe 'users', ->
  User = require("../../lib/model/user")
  
  it 'should hold name', ->
    user = User.User({name: "Greg"})
    user.name.should.equal "Greg"

  it 'should save name to database', ->
    saveUser = User.User({name: "Joe"})
    saveUser.save( (err, id) ->
      getUser = User.get(id, (err, user) ->
        user.name.should.equal "Joe"
      )
    )