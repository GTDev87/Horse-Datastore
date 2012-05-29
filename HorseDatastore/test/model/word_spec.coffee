require ("../helper")

describe 'words', ->
  Word = require("../../lib/model/word")
  
  it 'should hold name', ->
    word = Word.Word({name: "horse"})
    word.name.should.equal "horse"
    
  it 'should save name to database', ->
    saveWord = Word.Word({name: "horse"})
    saveWord.save()
    getWord = Word.get({name: "horse"})
    
    getWord.name.should.equal "horse"
    
  