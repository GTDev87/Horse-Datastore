require ("../helper")

describe 'users', ->
  User = require("../../lib/model/user")
  
  it 'should hold name', ->
    user = User.User({name: "Greg"})
    user.name.should.equal "Greg"
