/*
 * Copyright (c) 2013 Csernik Flaviu Andrei
 *
 * See the file LICENSE.txt for copying permission.
 * 
 */

/*jslint browser: true, bitwise: true, es5: true, indent: 2 nomen: true*/

(function (global) {

  "use strict";

  var twoPI = 2 * Math.PI;

  function windowHann(i, length) {

    return 0.5 * (1 - Math.cos(twoPI * i / (length - 1)));

  }

  function windowHamming(i, length) {

    return 0.54 - 0.46 * Math.cos(twoPI * i / (length - 1));

  }

  function selectWindowFunctionType(type) {

    switch (type) {
    case "Hamming":
      return windowHamming;
    case "Hann":
      return windowHann;
    case undefined:
      throw new ReferenceError("No window function type selected.");
    default:
      throw new ReferenceError("Unknown window function " + type);
    }
  }

  function WindowFunction() {

    var _type
      , _length
      , values
      , windowFunction
      ;

    Object.defineProperties(this, {
        "type" : {
            enumerable   : true
          , configurable : false
          , get : function () {
              return _type;
          }
          , set : function (tp) {

              var i;

              _type = tp;
              windowFunction = selectWindowFunctionType(tp);

              if (_length) {
                for (i = 0; i < _length; i += 1) {
                  values[i] = windowFunction(i, _length);
                }
              }
          }
      }
      , "length" : {
            enumerable   : true
          , configurable : false
          , get : function () {
              return _length;
            }
          , set : function (value) {

              var i;

              _length = value;
              values  = new Float32Array(_length);

              if (_type) {
                for (i = 0; i < _length; i += 1) {
                  values[i] = windowFunction(i, _length);
                }
              }
         }
      }
    });

    Object.defineProperty(WindowFunction.prototype, "process", {
        value : function (buffer) {

          if (buffer.length !== _length) {
            throw new TypeError("Given buffer is not the same length as" +
                                " the length property of WindowFunction." +
                                "\nExpected : " + _length +
                                "\nGiven    : " + buffer.length
                                );
          }

          buffer.map(function (v, i) { return v * values[i]; });

      }
      , enumerable   : true
      , configurable : false
      , writable     : false
    });
  }

  global.WindowObject = WindowFunction;

}(window));