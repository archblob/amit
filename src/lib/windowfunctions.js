var WindowObject = (function () {

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

  function WindowFunction(tp, len) {

    var type           = tp
      , length         = len
      , values         = new Float32Array(length)
      , windowFunction = selectWindowFunctionType(type)
      , i
      ;

    for (i = 0; i < length; i += 1) {
      values[i] = windowFunction(i, length);
    }

    Object.defineProperties(this, {
        "type" : {
            enumerable   : true
          , configurable : false
          , get : function () {

              if (!type) {
                throw new PropertyNotInitialized("WindowFunction", "type");
              }

              return type;
          }
          , set : function (tp) {

              var i;

              type = tp;
              windowFunction = selectWindowFunctionType(tp);

              if (length) {
                for (i = 0; i < length; i += 1) {
                  values[i] = windowFunction(i, length);
                }
              } else {
                throw new PropertyNotInitialized("WindowFunction", "length");
              }
          }
      }
      , "length" : {
            enumerable   : true
          , configurable : false
          , get : function () {

              if (!length) {
                throw new PropertyNotInitialized("WindowFunction", "length");
              }

              return length;
            }
          , set : function (value) {

              var i;

              length = value;
              values = new Float32Array(length);

              if (type) {
                for (i = 0; i < length; i += 1) {
                  values[i] = windowFunction(i, length);
                }
              } else {
                throw new PropertyNotInitialized("WindowFunction", "type");
              }
         }
      }
    });

    Object.defineProperty(WindowFunction.prototype, "process", {
        value : function (buffer) {

          if (!length) {
            throw new PropertyNotInitialized("WindowFunction", "length");
          }

          if (!type) {
            throw new PropertyNotInitialized("WindowFunction", "type");
          }

          if (buffer.length !== length) {
            throw new TypeError("Given buffer is not the same length as" +
                                " the length property of WindowFunction." +
                                "\nExpected : " + length +
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

  return WindowFunction;

}());
