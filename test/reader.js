/* -*- js-indent-level: 2; js2-basic-offset: 2; c-basic-offset: 2; -*- */
/* -*- indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";
var assert = require("assert");
var reader = require("../src/reader");
var symbols = require("../src/symbols");
var streams = require("../src/streams");

describe("reader", function() {
  describe("readtables", function() {
    describe("standard_readtable", function() {
      it("is accessible through the reader", function() {
        assert.equal(true, reader.hasOwnProperty("standard_readtable"));
      });
      var standard_readtable = reader.standard_readtable;
      it("has a read_base of 10 by default", function() {
        assert.equal(10, standard_readtable.read_base);
      });
      it("uses \\ as the string escape character", function() {
        assert.equal("\\", standard_readtable.string_escape_character);
      });
      it("has built-in macro_functions", function() {
        ["(", ")", "'", "\"", ";"].forEach(function(dispatch_char) {
          assert.equal(true, standard_readtable.macro_functions.hasOwnProperty("("));
        });
      });
      it("has built-in string_escape_mappings", function() {
        assert.deepEqual({
          "n": "\n",
          "r": "\r",
          "t": "\t",
          "s": " "
        }, standard_readtable.string_escape_mappings);
      });
      it("allows modification of the read_base to change number radix", function() {
        standard_readtable.read_base = 16;
        assert.equal(10, reader.read("a"));
        standard_readtable.read_base = 10;
        assert.equal(10, reader.read("10"));
      });
      it("allows modification of the string_escape_character", function() {
        standard_readtable.string_escape_character = "!";
        assert.equal("\n", reader.read("\"!n\""));
        standard_readtable.string_escape_character = "\\";
      });
      it("allows adding and removing macro_functions", function() {
        var macro_functions = standard_readtable.macro_functions;
        macro_functions["!"] = function(strm) {
          return ["not", reader.read(strm)];
        };
        assert.deepEqual(["not", 1], reader.read("!1"));
        delete macro_functions["!"];
        assert.equal(symbols.intern("!1"), reader.read("!1"));
      });
      it("allows adding and removing string_escape_mappings", function() {
        var mappings = standard_readtable.string_escape_mappings;
        mappings["x"] = "an x";
        assert.equal("an x", reader.read("\"\\x\""));
        delete mappings["x"];
        assert.equal("x", reader.read("\"\\x\""));
      });
    });
    describe("Readtable", function() {
      it("creates a new readtable similar to standard_readtable", function() {
        var standard_readtable = reader.standard_readtable;
        var new_readtable = new reader.Readtable();
        assert.deepEqual(standard_readtable.macro_functions,
                         new_readtable.macro_functions);
        assert.equal(standard_readtable.read_base,
                     new_readtable.read_base);
        assert.deepEqual(standard_readtable.string_escape_mappings,
                     new_readtable.string_escape_mappings);
        assert.equal(standard_readtable.string_escape_character,
                     new_readtable.string_escape_character);
      });
      // TODO
      describe("options", function() {});
    });
  });
  describe("read", function() {
    var read = reader.read;
    it("ignores leading and trailing whitespace", function() {
      assert.equal(1, read(" 1"));
      assert.equal(1, read("     1"));
      assert.equal(1, read("1 "));
      assert.equal(1, read("1    "));
      assert.equal(1, read("    1    "));
    });
    it("treats \\t, \\n, \\r and spaces as whitespace", function() {
      assert.equal(1, read("\t\n\r 1 \r\n\t"));
    });
    it("reads only a single expression from the input string", function() {
      assert.equal(1, read("1 2"));
      assert.equal(1, read("1)")); // One expression == no EOF
      assert.equal("foo", (read("foo)")).name);
      assert.deepEqual([1,2,3], read("(1 2 3) (4 5 6)"));
    });
    it("throws an EofError if there's nothing to read", function() {
      assert.throws(function() {read("");}, streams.EofError);
    });
    describe("tokens", function() {
      it("reads integers as integers in base10", function() {
        assert.equal(0, read("0"));
        assert.equal(1, read("1"));
        assert.equal(12345, read("12345"));
        assert.equal(10, read("+10"));
        assert.equal(-10, read("-10"));
        assert.notEqual(0xbebebe, read("bebebe"));
      });
      it("reads floats as floats", function() {
        assert.equal(1.0, read("1.0"));
        assert.equal(1.5, read("1.5"));
        assert.equal(12345.67890, read("12345.67890"));
        assert.equal(1.5, read("+1.5"));
        assert.equal(-1.5, read("-1.5"));
        assert.equal(1e10, read("1e10"));
        assert.equal(1e-10, read("1e-10"));
        assert.equal(1.5e10, read("1.5e10"));
        assert.equal(1.5e-10, read("1.5e-10"));
      });
      it("reads anything else as interned symbols", function() {
        var result = read("x");
        assert.equal(true, result instanceof symbols.Symbol);
        assert.equal(result, read("x"));
        assert.equal("foo-bar-baz", (read("foo-bar-baz")).name);
        assert.equal("foo.bar", (read("foo.bar")).name);
        assert.equal("-1.bar", (read("-1.bar")).name);
        assert.equal("bar.1e10", (read("bar.1e10")).name);
        assert.equal("-", (read("-")).name);
        assert.equal("+", (read("+")).name);
      });
    });
    describe("standard macro syntax", function() {
      it("reads arrays as JS arrays of other read items", function() {
        assert.deepEqual([1,2.5,"3"], read("(1 2.5 \"3\")"));
      });
      it("throws an EofError if it immediately reads an unmatched ')'", function() {
        assert.throws(function() {read(")");}, streams.EofError);
      });
      it("expands '<item> into (quote <item>)", function() {
        assert.deepEqual([symbols.intern("quote"), 1],
                         read("'1"));
        assert.deepEqual([symbols.intern("quote"), "foo"],
                         read("'\"foo\""));
        assert.deepEqual([symbols.intern("quote"), [1,2,3]],
                         read("'(1 2 3)"));
      });
      it("reads strings as strings", function() {
        assert.equal("foo", read("\"foo\""));
      });
      describe("string character escape syntax", function() {
        it("uses \\ as the escape character", function() {
          assert.equal("\\", read("\"\\\\\"")); // lol
          assert.equal("\\n", read("\"\\\\n\""));
        });
        it("reads \\n as a newline", function() {
          assert.equal("\n", read("\"\\n\""));
        });
        it("reads \\t as a tab", function() {
          assert.equal("\t", read("\"\\t\""));
        });
        it("reads \\r as a carriage return", function() {
          assert.equal("\r", read("\"\\r\""));
        });
        it("reads \\s as a single space", function() {
          assert.equal(" ", read("\"\\s\""));
        });
      });
    });
  });
});
