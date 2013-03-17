/* -*- js-indent-level: 2; js2-basic-offset: 2; c-basic-offset: 2; -*- */
/* -*- indent-tabs-mode: nil; -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80; */
"use strict";
(function (factory) {
  if (typeof define === "function" && typeof define.amd == "object" && define.amd) {
    define(factory);
  } else if (typeof module == "object" && module) {
    module.exports = factory();
  } else {
    window.clutterscript = factory();
  }
})(function () {

  var exports = {};

  /*
   * Streams
   *
   * Streams provide a simple Iterator-like interface for iterating over a
   * string.
   */
  var streams = exports.streams = (function(exports) {
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

    return exports;
  })({});

  /*
   * Symbols
   */
  var symbols = exports.symbols = (function(exports) {
    var SYMBOLS = {};
    var Symbol = exports.Symbol = function(name) {
      this.name = name;
    };

    Symbol.prototype.toString = function() {
      return this.name;
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

    return exports;
  })({});

  /*
   * Reader
   *
   * Reads ClutterScript code from a Stream and returns a value
   * representing the expression. The reader can be configured and extended
   * with reader macros which are able to dispatch on specific characters.
   */
  var reader = exports.reader = (function(streams, symbols, exports) {
    var merge = function(obj1, obj2) {
      var obj3 = {};
      for (var attr1 in obj1) {
        if (obj1.hasOwnProperty(attr1)) obj3[attr1] = obj1[attr1];
      };
      for (var attr2 in obj2) {
        if (obj2.hasOwnProperty(attr2)) obj3[attr2] = obj2[attr2];
      };
      return obj3;
    };

    var Readtable = exports.Readtable = function(opts) {
      opts = opts || {};
      var merge_with = opts.merge || exports.READTABLE || {};
      this.macro_functions = merge(merge_with.macro_functions,
                                   opts.macro_functions || {});
      this.read_base = opts.read_base || merge_with.read_base;
      this.string_escape_mappings = merge(merge_with.string_escape_mappings,
                                          opts.string_escape_mappings || {});
      this.string_escape_character = (opts.string_escape_character ||
                                      merge_with.string_escape_character);
    };

    exports.READTABLE = exports.standard_readtable = new Readtable({
      read_base: 10,
      macro_functions: {
        "(": function(strm) { return read_delimited_array(")", strm); },
        ")": function()     { throw new streams.EofError("Unmatched ')'"); },
        "'": function(strm) { return [symbols.intern("quote"), read(strm)]; },
        '"': function(strm) { return read_string('"', strm); },
        ";": function(strm) { read_line(strm, false); }
      },
      string_escape_character: "\\",
      string_escape_mappings: {
        "n": "\n",
        "r": "\r",
        "t": "\t",
        "s": " "
      }
    });

    var reset_readtable = exports.reset_readtable = function() {
      exports.READTABLE = exports.standard_readtable;
    };

    var WHITESPACE = " \r\t\n";

    function whitespacep(c) {
      return WHITESPACE.indexOf(c) !== -1;
    }

    var read_delimited_array = exports.read_delimited_array = function(end_char, stream) {
      var arr = [];
      for (var new_char = stream.peek(); new_char != end_char; new_char = stream.peek()) {
        arr.push(read(stream));
      }
      stream.next();
      return arr;
    };

    var read_string = exports.read_string = function(end_char, stream) {
      var result = "", escaped_char, escape_mapping;
      for (var new_char = stream.next(); new_char != end_char; new_char = stream.next()) {
        if (exports.READTABLE.string_escape_character === new_char) {
          escaped_char = stream.next();
          escape_mapping = exports.READTABLE.string_escape_mappings[escaped_char];
          result += escape_mapping?escape_mapping:escaped_char;
        } else {
          result += new_char;
        }
      }
      return result;
    };

    var read_line = exports.read_line = function(stream, eof_error, eof_val) {
      if (arguments.length == 1) eof_error = true;
      var str = "";
      for (var c = stream.peek(false, null);
           c !== "\n";
           c = stream.peek(false, null)) {
        if (eof_error && c === null) {
          throw new streams.EofError();
        } else  if (!eof_error && c === null) {
          return str;
        } else if (c === "\n") {
          stream.next();
          return str;
        } else {
          stream.next();
          str += c;
        }
      }
      return str;
    };

    function find_macro_function(c, stream) {
      // TODO - dispatching macro characters
      return exports.READTABLE.macro_functions[c];
    }

    function read_token(stream) {
      var token = "",
          collecting_token = false,
          macro_function,
          result;
      for (var c = stream.peek(true);
           c !== null;
           c = stream.peek(false, null)) {
        macro_function = find_macro_function(c, stream);
        if (macro_function && collecting_token) {
          return [token, false];
        } else if (macro_function) {
          stream.next(false);
          result = macro_function(stream, c);
          if (result !== undefined) return [result, true];
        } else if (collecting_token && whitespacep(c)) {
          stream.next(false);
          return [token, false];
        } else if (!collecting_token && whitespacep(c)) {
          stream.next(false);
        } else {
          stream.next(false);
          token += c;
          collecting_token = true;
        }
      }
      return [token, false];
    }

    function parse_token(token) {
      return (parse_integer_token(token) ||
              parse_float_token(token) ||
              parse_symbol_token(token));
    }

    function parse_integer_token(token) {
      var minusp = false,
          first_char = token[0],
          maybe_token,
          mantissa = 0;
      if ("-" == first_char) {
        maybe_token = token.substring(1);
        if (maybe_token.length) {
          minusp = true;
          token = maybe_token;
        }
      } else if ("+" == first_char) {
        maybe_token = token.substring(1);
        if (maybe_token.length) {
          token = maybe_token;
        }
      }
      for (var i = 0, parsed_digit; i < token.length; i++) {
        parsed_digit = parseInt(token[i], exports.READTABLE.read_base);
        if (isNaN(parsed_digit)) {
          return undefined;
        } else {
          mantissa = parsed_digit + (mantissa * exports.READTABLE.read_base);
        }
      }
      return minusp?-mantissa:mantissa;
    }

    function parse_float_token(token) {
      var minusp,
          found_point_p = false,
          found_digit_p = false,
          before_decimal = 0,
          after_decimal = 0,
          decimal_counter = 0,
          exponent = 0,
          i = 0,
          first_char = token[0],
          read_base = exports.READTABLE.read_base;
      if ("-" == first_char) {
        minusp = true;
        i++;
      } else if ("+" == first_char) {
        minusp = false;
        i++;
      }
      var c, weight, ex;
      for (; i < token.length; i++) {
        c = token[i];
        weight = parseInt(c, exports.READTABLE.read_base);
        if (isNaN(weight)) weight = false;
        if (weight && !found_point_p) {
          before_decimal = weight + (before_decimal * read_base);
          found_digit_p = true;
        } else if (weight && found_point_p) {
          after_decimal = weight + (after_decimal * read_base);
          found_digit_p = true;
          decimal_counter++;
        } else if ("." == c && !found_point_p) {
          found_point_p = true;
        } else if (("e" == c || "E" == c) && read_base == 10) {
          exponent = parse_integer_token(token.substring(i+1));
          if (exponent || exponent == 0) {
            i += token.substring(i+1).length;
          } else {
            return undefined;
          }
        } else {
          return undefined;
        }
      }
      var result = ((before_decimal
                     + (after_decimal * Math.pow(read_base, -decimal_counter)))
                    * Math.pow(read_base, exponent));
      if (found_digit_p) {
        return minusp?-result:result;
      } else {
        return undefined;
      }
    }

    function parse_symbol_token(token) {
      return symbols.intern(token);
    }

    function read_from_stream (stream) {
      var res = read_token(stream),
          token = res[0],
          donep = res[1];
      return donep?token:parse_token(token);
    }

    var read = exports.read = function (stream) {
      return read_from_stream(
        // TODO - more robust string check?
        (stream instanceof String || typeof stream == "string")?
          new streams.Stream(stream):
          stream);
    };

    return exports;
  })(streams, symbols, {});

  /*
   * Compiler
   */
  var compiler = exports.compiler = (function(exports) {
    var compile = exports.compile = function (node, env) {
      return node.compile(env);
    };

    return exports;
  })({});

  /*
   * ClutterScript main interface
   */
  var compile = exports.compile = function (string) {
    return "(function() { return "+string+"; })();";
  };

  return exports;
});
