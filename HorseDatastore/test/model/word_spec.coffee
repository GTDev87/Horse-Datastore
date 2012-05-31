{App} = require ("../helper")

describe 'words', ->
  Word = App.model.Word
  
  it 'should hold name', (done) ->
    word = Word.Word({name: "horse"})
    word.name.should.equal "horse"
    done()
    
  it 'should save name to database', (done)->
    saveWord = Word.Word({name: "horse"})
    saveWord.save (err, name) ->
      Word.get name, (err, word) ->
        word.name.should.equal "horse"
        done()