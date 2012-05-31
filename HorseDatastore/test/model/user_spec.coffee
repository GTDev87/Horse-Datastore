{App} = require ("../helper")

describe 'users', ->
  User = App.model.User
  Word = App.model.Word
  
  it 'should hold name', (done) ->
    user = User.User({name: "Greg"})
    user.name.should.equal "Greg"
    done()

  it 'should save name to database', (done) ->
    saveUser = User.User({name: "Joe"})
    saveUser.save (err, id) ->
      User.get id, (err, user) ->
        user.name.should.equal "Joe"
        done()
    
  it 'should users accept words', (done) ->
    user = User.User({name: "David"})
    nodejs = Word.Word({name: "node.js"})
    redis = Word.Word({name: "redis"})
    user.addWord(nodejs)
    user.addWord(redis)
    
    user.words.size().should.equal 2
    user.words[0].should.equal nodejs
    user.words[1].should.equal redis
    done()
    
  it 'should get saved words from database', (done) ->
    user = User.User({name: "Deepak"})
    user.save (err, id) ->
      User.get id, (err, savedUser) ->
        shiva = Word.Word({name: "Mecha Shiva"})
        ahhhh = Word.Word({name: "Heavy Metal AHHHH"})
        savedUser.addWord(shiva)
        savedUser.addWord(ahhhh)
        savedUser.save (err, id) ->
          User.get id, (err, deepak)  ->
            deepak.words.size().should.equal 2
            deepak.words[0].should.equal shiva
            deepak.words[1].should.equal ahhhh
            done()
