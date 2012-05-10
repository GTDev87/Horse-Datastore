requirejs = require("requirejs")

config =
  nodeRequire: require
  baseUrl: "."
  paths:
    cs: "./cs"
    CoffeeScript: "CoffeeScript"
    csBuild: "csBuild"

requirejs config, ["cs!config/app"], ->
  console.log("running server")