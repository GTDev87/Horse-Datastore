#compiler stuff
COMPILE_TYPE = coffee
COMPILER_MODULE = coffee-script
COMPILER_LOCATION = ./node_modules/coffee-script/bin/coffee

#Mocha
MOCHA = ./node_modules/.bin/mocha
REPORTER = spec
COFFEE_COMPILER = $(COMPILE_TYPE):$(COMPILER_MODULE)

#Test Folders
FOLDER = test
UNIT_FOLDER = test
ACCEPTANCE_FOLDER = features

#Tests to run
TESTS = $(shell find $(FOLDER) -name "*.$(COMPILE_TYPE)")
UNIT_TESTS = $(shell find $(UNIT_FOLDER) -name "*.$(COMPILE_TYPE)")
ACCEPTANCE_TESTS = $(shell find $(ACCEPTANCE_FOLDER) -name "*.$(COMPILE_TYPE)")

setup:
	npm install

test:
	NODE_ENV=test
	$(MOCHA) \
	--reporter $(REPORTER) \
	--compilers $(COFFEE_COMPILER) \
	$(TESTS)

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
	coffee ./main.coffee

db-server:
	redis-server

.PHONY: test unit features unit-watch server setup db-server
