MOCHA = ./node_modules/.bin/mocha
REPORTER = spec
COMPILE_TYPE = coffee
COMPILER_MODULE = coffee-script
UNIT_TESTS = test/*.$(COMPILE_TYPE)
ACCEPTANCE_TESTS = features/*.$(COMPILE_TYPE)
COFFEE_COMPILER = $(COMPILE_TYPE):$(COMPILER_MODULE)
FOLDER = test
COMPILER_LOCATION = ./node_modules/coffee-script/bin/coffee

setup:
	rm -rf ./r.js
	curl -o CoffeeScript.js https://raw.github.com/jashkenas/coffee-script/master/extras/coffee-script.js
	curl -o cs.js https://raw.github.com/jrburke/require-cs/latest/cs.js
	curl -o csBuild.js https://raw.github.com/jrburke/require-cs/latest/csBuild.js
	cp node_modules/requirejs/bin/r.js .
	npm install

test:
	NODE_ENV=test
	$(MOCHA) \
	--reporter $(REPORTER) \
	--compilers $(COFFEE_COMPILER) \
	./$(FOLDER)/*

unit:
	NODE_ENV=test
	$(MOCHA) \
	--reporter $(REPORTER) \
	--compilers $(COFFEE_COMPILER) \
	$(UNIT_TESTS)
      
unit-watch:
	NODE_ENV=test
	$(MOCHA) \
	--reporter $(REPORTER) \
	--compilers $(COFFEE_COMPILER) \
	$(UNIT_TESTS)

features:
	NODE_ENV=test
	$(MOCHA) \
	--reporter $(REPORTER) \
	--compilers $(COFFEE_COMPILER) \
	$(ACCEPTANCE_TESTS)

server:
	NODE_ENV=production
	$(COMPILER_LOCATION) ./config/main.coffee

.PHONY: test unit features unit-watch server setup
