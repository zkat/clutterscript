/* -*- js-indent-level: 2; js2-basic-offset: 2; c-basic-offset: 2; -*- */
/* -*- indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

var utils = require("./utils"),
    symbols = require("./symbols"),
    nodes = require("./nodes"),
    lexenvs = require("./lexenvs");

var objectify = exports.objectify = function(form, env) {
  if (utils.isArray(form)) {
    return objectify_operation(form[0], form.slice(1), env);
  } else {
    if (symbols.isSymbol(form)) {
      return objectify_symbol(form, env);
    } else {
      return objectify_literal(form, env);
    }
  }
};

function objectify_literal(form, env) {
  return new nodes.Literal(form);
}

function objectify_symbol(symbol, env) {
  var variable = lexenvs.find_variable(env, symbol);
  if (variable) {
    return new nodes.Reference(variable);
  } else {
    return objectify_free_global_variable(symbol, env);
  }
}

function objectify_free_global_variable(symbol, env) {
  console.warn("Compiling reference to unknown variable");
  // TODO - don't extend the single global lexenv, wtf
  return new nodes.Reference(lexenvs.extend(lexenvs.GLOBAL_LEXENV, symbol));
}


function objectify_operation(op, args, env) {
  return new nodes.Operation(objectify(op, env),
                             args.map(function(arg) {
                               return objectify_literal(arg, env);
                             }));
};

function objectify_alternative(cond, cons, alt, env) {
  return new nodes.Alternative(objectify(cond, env),
                               objectify(cons, env),
                               objectify(alt, env));
}

function objectify_sequence(forms, env) {
  return new nodes.Sequence(
    forms.map(function(arg) {
      return objectify(arg, env);
    }));
}

function objectify_abstraction(arglist, body, env) {
  // TODO - need to create a subenv here
  return new nodes.Abstraction(
    arglist.map(function(arg) {
      return objectify_symbol(arg, env);
    }),
    objectify_sequence(body, env)
  );
}
/*
 * Special forms
 */
var SPECIAL_FORMS = {
  if: function(args, env) {
    return objectify_alternative(args[0], args[1], args[2], env);
  },
  do: objectify_sequence,
  lambda: function(args, env) {
    return objectify_abstraction(args[0], args.slice(1), env);
  }
};

