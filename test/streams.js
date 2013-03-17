/* -*- js-indent-level: 2; js2-basic-offset: 2; c-basic-offset: 2; -*- */
/* -*- indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";
var assert = require("assert");
var clutterscript = require("../src/clutterscript");

describe("streams", function() {
  var streams = clutterscript.streams;
  describe("Stream", function() {
    var Stream = streams.Stream;
    var EofError = streams.EofError;
    describe("#next", function() {
      it("consumes and returns the next item in the stream", function() {
        var stream = new Stream("foo");
        assert.equal("f", stream.next());
        assert.equal("o", stream.next());
        assert.equal("o", stream.next());
      });
      it("throws an EofError if there's nothing left to consume", function() {
        var stream1 = new Stream("");
        assert.throws(function() {stream1.next();}, EofError);
        var stream2 = new Stream("foo");
        stream2.next();
        stream2.next();
        stream2.next();
        assert.throws(function() {stream2.next();}, EofError);
      });
      it("throws an EofError if eof_error is truthy", function() {
        var stream = new Stream("");
        assert.throws(function() {stream.next(true);}, EofError);
        assert.throws(function() {stream.next({});}, EofError);
        assert.throws(function() {stream.next(1);}, EofError);
        assert.throws(function() {stream.next(true, "some eof val");}, EofError);
      });
      it("returns undefined if eof_error is falsy", function() {
        var stream = new Stream("");
        assert.equal(undefined, stream.next(false));
        assert.equal(undefined, stream.next(null));
        assert.equal(undefined, stream.next(0));
        assert.equal(undefined, stream.next(undefined));
      });
      it("returns eof_val if eof_error is falsy", function() {
        var stream = new Stream("");
        var eof_val = "got an eof";
        assert.equal(eof_val, stream.next(false, eof_val));
      });
    });
    describe("#peek", function() {
      it("returns the next item in the stream without consuming it", function() {
        var stream = new Stream("foo");
        assert.equal("f", stream.peek());
        assert.equal("f", stream.peek());
      });
      it("throws an EofError if there's nothing left to consume", function() {
        var stream1 = new Stream("");
        assert.throws(function() {stream1.peek();}, EofError);
        var stream2 = new Stream("foo");
        stream2.next();
        stream2.next();
        stream2.next();
        assert.throws(function() {stream2.peek();}, EofError);
      });
      it("throws an EofError if eof_error is truthy", function() {
        var stream = new Stream("");
        assert.throws(function() {stream.peek(true);}, EofError);
        assert.throws(function() {stream.peek({});}, EofError);
        assert.throws(function() {stream.peek(1);}, EofError);
        assert.throws(function() {stream.peek(true, "some eof val");}, EofError);
      });
      it("returns undefined if eof_error is falsy", function() {
        var stream = new Stream("");
        assert.equal(undefined, stream.peek(false));
        assert.equal(undefined, stream.peek(null));
        assert.equal(undefined, stream.peek(0));
        assert.equal(undefined, stream.peek(undefined));
      });
      it("returns eof_val if eof_error is falsy", function() {
        var stream = new Stream("");
        var eof_val = "got an eof";
        assert.equal(eof_val, stream.peek(false, eof_val));
      });
    });
  });
});
