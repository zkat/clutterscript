/* -*- js-indent-level: 2; js2-basic-offset: 2; c-basic-offset: 2; -*- */
/* -*- indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

/*
 * Types
 */
function isType(x, Type) {
  return Object.prototype.toString.call(x) == "[object "+Type+"]";
}

exports.isArray = function(x) {
  return isType(x, "Array");
};

exports.isString = function(x) {
  return isType(x, "String");
};

exports.isNumber = function(x) {
  return isType(x, "Number");
};

/*
 * Array-likes
 */
exports.find = function(match, seq, opts) {
  opts = opts || {};
  var test = opts.test || eql;
  return find_if(function(x) { return test(match, x); }, seq, opts);
};

exports.find_if_not = function(test, seq, opts) {
  return find_if(complement(test), seq, opts);
};

var find_if = exports.find_if = function(test, seq, opts) {
  opts = opts || {};
  var key = opts.key || identity;
  var start = opts.start || 0;
  var end = opts.end || seq.length;
  for (var i = 0; i < seq.length; i++) {
    if (test(key(seq[i]))) {
      return seq[i];
    }
  }
  return null;
};

/*
 * Functional utilities
 */
var complement = exports.complement = function(x) {
  return function() {
    return !x.apply(this, arguments);
  };
};

var eql = exports.eql = function(x, y) { return x === y; };

var identity = exports.identity = function(x) { return x; };

exports.getter = function(property_name) {
  return function(obj) { return obj[property_name]; };
};

exports.method = function(method_name) {
  return function(obj) {
    return obj[method_name].apply(obj, [].slice.call(arguments, 1));
  };
};

/*
 * Objects
 */
exports.make_maker = function(Constructor) {
  return function() {
    var args = arguments;
    var new_obj = Object.create(Constructor.prototype);
    var ret = Constructor.apply(new_obj, arguments);
    return typeof ret === "object" && ret !== null ? ret : new_obj;
  };
};

exports.merge = function(obj1, obj2) {
  var obj3 = {};
  for (var attr1 in obj1) {
    if (obj1.hasOwnProperty(attr1)) obj3[attr1] = obj1[attr1];
  };
  for (var attr2 in obj2) {
    if (obj2.hasOwnProperty(attr2)) obj3[attr2] = obj2[attr2];
  };
  return obj3;
};

/*
 * Converting identifiers
 */
exports.ensure_js_identifier = function(name) {
  // Punt on JSification for now. It'll take a while.
  return name;
};

// http://es5.github.com/x7.html#x7.6.1
var JS_KEYWORDS = ["break", "case", "catch", "continue",
                   "debugger", "default", "delete", "do",
                   "else", "finally", "for", "function",
                   "if", "in", "instanceof", "new", "return",
                   "switch", "this", "throw", "try", "typeof",
                   "var", "void", "while", "with"];
var JS_FUTURE_RESERVED_WORDS = ["class", "const", "enum", "export",
                                "extends", "import", "super"];
var JS_STRICT_FUTURE_RESERVED_WORDS =
      ["implements", "interface", "let", "package", "private",
       "protected", "public", "static", "yield"];
var JS_NULL_LITERAL = ["null"];
var JS_BOOLEAN_LITERAL = ["true", "false"];
var ADDITIONAL_RESERVATIONS = ["eval"];
var JS_RESERVED_WORDS =
      JS_KEYWORDS + JS_FUTURE_RESERVED_WORDS +
      JS_STRICT_FUTURE_RESERVED_WORDS +
      JS_NULL_LITERAL + JS_BOOLEAN_LITERAL +
      ADDITIONAL_RESERVATIONS;

var JS_PUNCTUATORS = {
  "{": "lcurly",
  "}": "rcurly",
  "(": "lparen",
  ")": "rparen",
  "[": "lsquare",
  "]": "rsquare",
  ".": "dot",
  ";": "semicolon",
  ",": "comma",
  "<": "lt",
  ">": "gt",
  "=": "eq",
  "!": "bang",
  "+": "plus",
  "-": "minus",
  "*": "times",
  "%": "perc",
  "&": "amp",
  "|": "pipe",
  "^": "hat",
  "~": "tilde",
  "?": "question",
  ":": "colon",
  "/": "slash"
};
