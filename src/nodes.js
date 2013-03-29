/* -*- js-indent-level: 2; js2-basic-offset: 2; c-basic-offset: 2; -*- */
/* -*- indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

var utils = require("./utils");
var symbols=require("./symbols");

var Literal = exports.Literal = function(value) {
  this.value = value;
};
Literal.prototype.compile = function compile() {
  if (utils.isString(this.value)) {
    return '"'+this.value+'"';
  } else if (symbols.isSymbol(this.value)) {
    return "clutterscript.symbols.intern(\""+this.value+"\")";
  } else if (utils.isArray(this.value)) {
    return "[" +
      this.value.map(function(val) {
        return compile.call(val);
      }).join(", ") +
      "]";
  } else {
    return ""+this.value;
  }
};

var Reference = exports.Reference = function(variable) {
  this.variable = variable;
};
Reference.prototype.compile = function() {
  return utils.ensure_js_identifier(this.variable.symbol.name);
};

var Application = exports.Application = function(applicative, args) {
  this.applicative = applicative,
  this.arguments = args;
};
Application.prototype.compile = function() {
  return this.applicative.compile() +
    "(" +
    this.arguments.map(function(arg) {
      return arg.compile();
    }).join(", ")
    + ")";
};

var Alternative = exports.Alternative = function(condition, consequent, alternant) {
  this.condition = condition;
  this.consequent = consequent;
  this.alternant = alternant;
};
Alternative.prototype.compile = function() {
  return this.condition.compile() + "?" +
    this.consequent.compile() + ":" +
    this.alternant.compile();
};

var Sequence = exports.Sequence = function(expressions) {
  this.expressions = expressions;

};
Sequence.prototype.compile = function() {
  return this.expressions.map(function(expr) {
    return expr.compile();
  }).join(", ");
};

var Abstraction = exports.Abstraction = function(args, body) {
  this.args = args;
  this.body = body;
};
Abstraction.prototype.compile = function() {
  return "(function(" +
    this.args.map(function(arg) { return arg.compile(); }).join(", ") +
    ") { return " +
    this.body.compile() +
    "; })";
};
