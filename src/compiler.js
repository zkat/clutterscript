/* -*- js-indent-level: 2; js2-basic-offset: 2; c-basic-offset: 2; -*- */
/* -*- indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

var reader = require("./reader"),
    lexenvs = require("./lexenvs"),
    objectification = require("./objectification");

var compile = exports.compile = function (string, env) {
  // TODO - this only reads a single expression
  return compile_form(reader.read(string), lexenvs.make_lexenv(env));
};

var compile_form = exports.compile_form = function(form, env) {
  return objectification.objectify(form, env).compile();
};
