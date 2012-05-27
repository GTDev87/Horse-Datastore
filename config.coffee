currentEnv = process.env.NODE_ENV or 'production'

exports.env =
  production: false
  test: false

exports.env[currentEnv] = true
  
exports.config =
  appName: "Horse Datastore"

  
exports.log =
  path: __dirname + "/log/app_#{currentEnv}.log"

exports.server =
  port: 8081
  ip: '127.0.0.1'
    
exports.db =
  secret: "secretkey"
  
  production:
    name: "horse_datastore"
  test:
    name: "horse_datastore_test"
    
  host: "127.0.0.1"