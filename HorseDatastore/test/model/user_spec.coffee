require ("../helper")

chai = require 'chai'
chai.should()

console.log("I WAS HERE")

describe 'test', ->
  it 'should test something', ->
    foo = 0
    foo.should.equal 0
