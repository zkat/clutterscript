/* -*- js-indent-level: 2; js2-basic-offset: 2; c-basic-offset: 2; -*- */
/* -*- indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";
var assert = require("assert");
var clutterscript = require("../src/clutterscript");

describe("compiler", function() {
  var compiler = clutterscript.compiler;
  describe("compile", function() {
    var compile = compiler.compile;
    it("compiles a string of ClutterScript code to JavaScript", function() {
    });
  });
  describe("compile_form", function() {
    var compile_form = compiler.compile_form;
    var Lexenv = compiler.lexenvs.Lexenv;
    it("compiles literals into their string representation", function() {
      var env = new Lexenv();
      assert.equal("1", compile_form(1, env));
      assert.equal("1.5", compile_form(1.5, env));
      assert.equal("\"foo\"", compile_form("foo", env));
    });
    it("compiles variables into valid JavaScript variables", function() {
      var intern = clutterscript.symbols.intern;
      var env = new Lexenv();
      assert.equal("foo", compile_form(intern("foo"), env));
      assert.equal("foo123", compile_form(intern("foo123"), env));
      assert.equal("foo_bar", compile_form(intern("foo_bar"), env));
    });
    it("compiles applications into JS function calls", function() {
      var intern = clutterscript.symbols.intern;
      var env = new Lexenv();
      assert.equal("foo(1)", compile_form([intern("foo"), 1], env));
      assert.equal("foo()", compile_form([intern("foo")], env));
      assert.equal("foo(1, 2)", compile_form([intern("foo"), 1, 2], env));
    });
    it("compiles if forms to ternary JS expressions", function() {
      var intern = clutterscript.symbols.intern;
      var env = new Lexenv();
      assert.equal("1?2:3", compile_form([intern("if"), 1, 2, 3], env));
    });
  });
});
