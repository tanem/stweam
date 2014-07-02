REPORTER=spec

lint:
	@./node_modules/.bin/jshint ./lib/*.js ./test/*.js index.js

test:
	@$(MAKE) lint
	@NODE_ENV=test ./node_modules/.bin/mocha --harmony -b --reporter $(REPORTER)

test-cov:
	@$(MAKE) lint
	@NODE_ENV=test node --harmony ./node_modules/.bin/istanbul cover \
	./node_modules/mocha/bin/_mocha -- -R spec

test-coveralls:
	echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	$(MAKE) test
	@NODE_ENV=test node --harmony ./node_modules/.bin/istanbul cover \
	./node_modules/mocha/bin/_mocha --report lcovonly -- -R spec && \
		cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js || true

.PHONY: lint test test-cov test-coveralls