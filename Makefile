MOCHA = ./node_modules/.bin/mocha
REPORTER = spec
COMPILE_TYPE = coffee
UNIT_TESTS = test/*.$(COMPILE_TYPE)
ACCEPTANCE_TESTS = features/*.$(COMPILE_TYPE)
COFFEE_COMPILER = $(COMPILE_TYPE):coffee-script

test-unit:
	$(MOCHA) \
	--reporter $(REPORTER) \
	--compilers $(COFFEE_COMPILER) \
	$(UNIT_TESTS)
      
test-unit-watch:
	$(MOCHA) \
	--reporter $(REPORTER) \
	--compilers $(COFFEE_COMPILER) \
	$(UNIT_TESTS)

test-acceptance:
	$(MOCHA) \
	--reporter $(REPORTER) \
	--compilers $(COFFEE_COMPILER) \
	$(ACCEPTANCE_TESTS)

run:
	coffee lib/server.$(COMPILE_TYPE)

.PHONY: test-unit test-acceptance test-unit-watch run
