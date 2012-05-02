#Set the current environment to true in the env object
currentEnv = process.env.NODE_ENV or 'production'
exports.appName = "Horse Datastore"

exports.env =
  production: false
  test: false
  
exports.env[currentEnv] = true

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