/* -*- js-indent-level: 2; js2-basic-offset: 2; c-basic-offset: 2; -*- */
/* -*- indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

var SYMBOLS = {};
var Symbol = exports.Symbol = function(name) {
  this.name = name;
};

Symbol.prototype.toString = function() {
  return this.name;
};

var isSymbol = exports.isSymbol = function(x) {
  return x instanceof Symbol;
};

var intern = exports.intern = function(name) {
  if (!SYMBOLS[name]) {
    SYMBOLS[name] = new Symbol(name);
  }
  return SYMBOLS[name];
};

var unintern = exports.unintern = function(name) {
  delete SYMBOLS[name];
};
