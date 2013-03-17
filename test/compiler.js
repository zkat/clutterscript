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
      assert.equal("1", compile_form(1, new Lexenv()));
      assert.equal("1.5", compile_form(1.5, new Lexenv()));
      assert.equal("\"foo\"", compile_form("foo", new Lexenv()));
    });
  });
});
