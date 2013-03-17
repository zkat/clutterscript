/* -*- js-indent-level: 2; js2-basic-offset: 2; c-basic-offset: 2; -*- */
/* -*- indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";
var assert = require("assert");
var clutterscript = require("../src/clutterscript");

describe("clutterscript", function() {
  describe("compile", function() {
    var compile = clutterscript.compile;
    it("compiles a string to an IIFE of javascript code", function() {
      assert.equal("(function() { return 1; })();", compile("1"));
    });
  });
});
