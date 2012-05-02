MOCHA = ./node_modules/.bin/mocha
REPORTER = spec
COMPILE_TYPE = coffee
UNIT_TESTS = test/*.$(COMPILE_TYPE)
ACCEPTANCE_TESTS = features/*.$(COMPILE_TYPE)
COFFEE_COMPILER = $(COMPILE_TYPE):coffee-script
FOLDER = test

test:
	$(MOCHA) \
	--reporter $(REPORTER) \
	--compilers $(COFFEE_COMPILER) \
	./$(FOLDER)/*

unit:
	$(MOCHA) \
	--reporter $(REPORTER) \
	--compilers $(COFFEE_COMPILER) \
	$(UNIT_TESTS)
      
unit-watch:
	$(MOCHA) \
	--reporter $(REPORTER) \
	--compilers $(COFFEE_COMPILER) \
	$(UNIT_TESTS)

features:
	$(MOCHA) \
	--reporter $(REPORTER) \
	--compilers $(COFFEE_COMPILER) \
	$(ACCEPTANCE_TESTS)

server:
	coffee lib/server.$(COMPILE_TYPE)

.PHONY: test unit features unit-watch server
