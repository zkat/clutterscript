/* -*- js-indent-level: 2; js2-basic-offset: 2; c-basic-offset: 2; -*- */
/* -*- indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

var utils = require("./utils");

var Literal = exports.Literal = function(value) {
  this.value = value;
};
Literal.prototype.compile = function() {
  return new Fragment(
    utils.isString(this.value)?'"'+this.value+'"':""+this.value).code;
};

var Reference = exports.Reference = function(variable) {
  this.variable = variable;
};
Reference.prototype.compile = function() {
  return new Fragment(
    utils.ensure_js_identifier(this.variable.symbol.name)).code;
};

var Application = exports.Application = function(applicative, args) {
  this.applicative = applicative,
  this.arguments = args;
};
Application.prototype.compile = function() {
  return new Fragment(this.applicative.compile() +
                      "(" +
                      this.arguments.map(function(arg) {
                        return arg.compile();
                      }).join(", ")
                      + ")").code;
};

var Alternative = exports.Alternative = function(condition, consequent, alternant) {
  this.condition = condition;
  this.consequent = consequent;
  this.alternant = alternant;
};
Alternative.prototype.compile = function() {
  return new Fragment(this.condition.compile() + "?" +
                      this.consequent.compile() + ":" +
                      this.alternant.compile()).code;
};

var Sequence = exports.Sequence = function(expressions) {
  this.expressions = expressions;

};
Sequence.prototype.compile = function() {
  return new Fragment(this.expressions.map(function(expr) {
    return expr.compile();
  }).join(", ")).code;
};

var Abstraction = exports.Abstraction = function(args, body) {
  this.args = args;
  this.body = body;
};
Abstraction.prototype.compile = function() {
  return new Fragment(
    "(function(" +
      this.args.map(function(arg) { return arg.compile(); }).join(", ") +
      ") { return " +
      this.body.compile() +
      "; })").code;
};

/*
 * Misc
 */
function Fragment(code, location_info) {
  this.code = code;
  this.location_info = location_info;
}

