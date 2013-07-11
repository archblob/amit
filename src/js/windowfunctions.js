/*
 * Copyright (c) 2013 Csernik Flaviu Andrei
 *
 * See the file LICENSE.txt for copying permission.
 * 
 */

(function (global){

  "use strict";

  var twoPI = 2 * Math.PI;

  function windowHann(i,length) {

    return 0.5 * (1 - Math.cos(twoPI * i / (length - 1)));

  }

  function windowHamming(i,length) {

    return 0.54 - 0.46 * Math.cos(twoPI * i / (length - 1));

  }

  function selectWindowFunctionType(type) {

    switch (type) {
      case "Hamming" :
        return windowHamming;
      case "Hann" :
        return windowHann;
      case undefined :
        throw new ReferenceError("No window function type selected.");
      default : 
        throw new ReferenceError("Unknown window function " + type);
    }
  }

  function WindowFunction() {

    var _type;
    var _length;

    var values;
    var windowFunction;

    Object.defineProperties(this,{
       "type" : {
         enumerable   : true,
         configurable : false,
         get : function () {
           return _type;
         },
         set : function (tp) {

           _type = tp;
           windowFunction = selectWindowFunctionType(tp);

           if (_length) {
             for (var i = 0 ; i < _length ; i++) {
               values[i] = windowFunction(i, _length);
             }
           }
         }
       },
      "length" : {
        enumerable   : true,
        configurable : false,
        get : function () {
          return _length;
        },
        set : function (value) {

          _length = value;
          values  = new Float32Array(_length);

          if (_type) {
            for (var i = 0 ; i < _length ; i++) {
              values[i] = windowFunction(i, _length);
            }
          }
        }
      }
    });
    
    Object.defineProperty(WindowFunction.prototype, "process", {
      value : function (buffer) {

        if (buffer.length != _length) {
          throw new TypeError("Given buffer is not the same length as" +
                              " the length property of WindowFunction." +
                              "\nExpected : " + _length +
                              "\nGiven    : " + buffer.length
                              );
          }

        buffer.map(function (v,i,l) { return v * values[i]; });

      },
      enumerable   : true,
      configurable : false,
      writable     : false
      
    });
  }

  global["WindowObject"] = WindowFunction;

}(window));