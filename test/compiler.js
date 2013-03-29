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
    var make_lexenv = compiler.lexenvs.make_lexenv;
    it("compiles literals into their string representation", function() {
      var env = make_lexenv();
      assert.equal("1", compile_form(1, env));
      assert.equal("1.5", compile_form(1.5, env));
      assert.equal("\"foo\"", compile_form("foo", env));
    });
    it("compiles variables into valid JavaScript variables", function() {
      var intern = clutterscript.symbols.intern;
      var env = make_lexenv();
      assert.equal("foo", compile_form(intern("foo"), env));
      assert.equal("foo123", compile_form(intern("foo123"), env));
      assert.equal("foo_bar", compile_form(intern("foo_bar"), env));
    });
    it("compiles applications into JS function calls", function() {
      var intern = clutterscript.symbols.intern;
      var env = make_lexenv();
      assert.equal("foo(1)", compile_form([intern("foo"), 1], env));
      assert.equal("foo()", compile_form([intern("foo")], env));
      assert.equal("foo(1, 2)", compile_form([intern("foo"), 1, 2], env));
    });
    it("compiles if forms to ternary JS expressions or if statements", function() {
      var intern = clutterscript.symbols.intern;
      var env = make_lexenv();
      assert.equal("if (1) { 2; } else { 3; }",
                   compile_form([intern("if"), 1, 2, 3], env));
      assert.equal("foo(1?2:3)",
                   compile_form([intern("foo"), [intern("if"), 1, 2, 3]], env));
    });
    it("compiles do forms to a sequence of JS expressions or statements", function() {
      var intern = clutterscript.symbols.intern;
      var env = make_lexenv();
      assert.equal("1", compile_form([intern("do"), 1], env));
      assert.equal("1; 2; 3;", compile_form([intern("do"), 1, 2, 3], env));
      assert.equal("foo((1, 2, 3), 4)",
                   compile_form([intern("foo"), [intern("do"), 1, 2, 3], 4], env));
    });
    it("compiles lambda forms to JS function expressions", function() {
      var intern = clutterscript.symbols.intern;
      var env = make_lexenv();
      assert.equal("(function() { return 1; })",
                   compile_form([intern("lambda"), [], 1], env));
      assert.equal("(function(x) { return x; })",
                   compile_form([intern("lambda"), [intern("x")], intern("x")],
                                env));
      var args = ["x", "y", "z"].map(intern);
      assert.equal("(function(x, y, z) { return x, y, z; })",
                   compile_form([intern("lambda"), args].concat(args),
                                env));
    });
  });
});
