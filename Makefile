bin = $(shell npm bin)

.PHONY: compile
compile: build/clutterscript.min.js build/clutterscript.js.src

build/clutterscript.min.js build/clutterscript.js.src: build/clutterscript.js
	$(bin)/uglifyjs build/clutterscript.js \
		-o build/clutterscript.min.js \
		--source-map build/clutterscript.js.src

build/clutterscript.js: src/*.js | build
	$(bin)/browserify src/clutterscript.js -o build/clutterscript.js

build:
	mkdir -p build

.PHONY: clean
clean:
	-rm -f build/*

.PHONY: test
test:
	$(bin)/mocha --reporter spec
