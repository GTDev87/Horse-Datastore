MOCHA = ./node_modules/.bin/mocha
REPORTER = spec
COMPILE_TYPE = coffee
UNIT_TESTS = test/*.$(COMPILE_TYPE)
ACCEPTANCE_TESTS = features/*.$(COMPILE_TYPE)
COFFEE_COMPILER = $(COMPILE_TYPE):coffee-script
FOLDER = test

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
	coffee ./config/app.$(COMPILE_TYPE)

.PHONY: test unit features unit-watch server
