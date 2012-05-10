define ->
  currentEnv = process.env.NODE_ENV or 'production'
  
  env[currentEnv] = true
  
  config =
    appName: "Horse Datastore"

    env:
      production: false
      test: false
  
    log:
      path: __dirname + "/log/app_#{currentEnv}.log"

    server:
      port: 8081
      ip: '127.0.0.1'
    
    db: 
      secret: "secretkey"
  
      production:
        name: "horse_datastore"
      test:
        name: "horse_datastore_test"
        
  return config