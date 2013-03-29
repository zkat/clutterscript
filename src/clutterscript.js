/* -*- js-indent-level: 2; js2-basic-offset: 2; c-basic-offset: 2; -*- */
/* -*- indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";
var compiler = require("./compiler");

/*
 * ClutterScript main interface
 */
exports.compile = function (string) {
  return "(function() { return "+string+"; })();";
};
