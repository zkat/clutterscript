/* -*- js-indent-level: 2; js2-basic-offset: 2; c-basic-offset: 2; -*- */
/* -*- indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

var utils = require("./utils");

exports.GLOBAL_LEXENV = undefined;

function Lexenv(parent, variables) {
  this.parent = parent || exports.GLOBAL_LEXENV;
  this.variables = variables || [];
};

var make_lexenv = exports.make_lexenv = utils.make_maker(Lexenv);

exports.extend = function(lexenv, symbol) {
  var variable = new Variable(symbol);
  lexenv.variables.push(variable);
  return variable;
};

exports.find_variable = function find_variable(env, symbol) {
  return utils.find(symbol, env.variables, {
    key: utils.getter("symbol")
  }) || (env.parent ? find_variable(env.parent, symbol) : false);
};

function symbolicate(x) { return new Variable(x); };
function Variable(symbol) {
  this.symbol = symbol;
}

exports.GLOBAL_LEXENV = make_lexenv();
