/* -*- js-indent-level: 2; js2-basic-offset: 2; c-basic-offset: 2; -*- */
/* -*- indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";

var Stream = exports.Stream = function(string, from, to) {
  this.string = string;
  this.pos = (from || 0) - 1;
  this.end = to || string.length;
};

Stream.prototype.next = function(eof_error, eof_val) {
  var next = this.peek.apply(this, arguments);
  if (next !== eof_val) this.pos++;
  return next;
};

Stream.prototype.peek = function(eof_error, eof_val) {
  if (!arguments.length) eof_error = true;
  if (this.end == (this.pos+1)) {
    if (eof_error) {
      throw new EofError();
    } else {
      return eof_val;
    }
  }
  return this.string[this.pos+1];
};

var EofError = exports.EofError = function(message, stream) {
  this.name = "EofError";
  this.stream = stream;
  this.message = message ||
    "Encountered end-of-file while processing stream.";
};

EofError.prototype = new Error();

EofError.prototype.constructor = EofError;
