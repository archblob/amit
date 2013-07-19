var Ring = (function () {

  function IndexOutOfBounds(maxIndex, requestedIndex, method) {
    this.maxIndex       = maxIndex;
    this.requestedIndex = requestedIndex;
    this.method         = method;
  }

  IndexOutOfBounds.prototype.toString = function () {
    return "Invalid index in method ['" + this.method + "']\n" +
           "Requested index    : " + this.requestedIndex +
           "\nValid _buffer index : [0.." + this.maxIndex + "]";
  };

  function ImproperBlockLength(ringBlockLength, givenBlockLength) {
    this.ringBlockLength  = ringBlockLength;
    this.givenBlockLength = givenBlockLength;
  }

  ImproperBlockLength.prototype.toString = function () {
    return "Block length mismatch.\n" +
           "Requeste block length : " + this.givenBlockLength + "\n" +
           "Valid block length    : " + this.ringBlockLength;
  };

  function Ring(len, blockLen) {
    
    var length      = len
      , maxIndex    = length - 1
      , start       = 0
      , buffer      = new Float32Array(length)
      , blockLength = 0;

    /* blockLength should always be a factor of size.
     * An exception is thrown if it's not;
     */
    blockLength = 0;

    if (blockLen) {

      if (len % blockLen !== 0) {
        throw "Block length must be a factor of length.";
      }

      blockLength = blockLen;

    }

    Object.defineProperties(this,{
        "length" : {
            value        : length
          , enumerable   : true
          , configurable : false
          , writable     : false
        }
      , "blockLength" : {
            value        : blockLength
          , enumerable   : true
          , configurable : false
          , writable     : false
      }
    });

    Object.defineProperties(Ring.prototype, {
        "get" : {
            value : function (index) {
              checkBounds(index, maxIndex, 'get');

              return buffer[relativeIndex(index, start, length)];
            }
          , enumerable   : true
          , configurable : false
          , writable     : false
        }
      , "set" : {
           value : function (index, value) {

             checkBounds(index, maxIndex, 'set');

             buffer[relativeIndex(index, start, length)] = value;
           }
         , enumerable   : true
         , configurable : false
         , writable     : false
        }
      , "concat" : {
            value : function (arr) {

              var alen = arr.length
                , nlen = start + alen;

              if (alen !== blockLength) {
                throw new ImproperBlockLength(blockLength, alen);
              }

              buffer.set(arr, start);

              if (start + alen >= length) {
                  start = 0;
              } else {
                  start = nlen;
              }
            }
          , enumerable   : true
          , configurable : false
          , writable     : false
        }
      , "map" : {
            value : function (callback) {

              var relativeIndex
                , value
                , i;

              for (i = 0; i < length; i += 1) {
                relativeIndex = relativeIndex(i, start, length);
                value = buffer[relativeIndex];

                buffer[relativeIndex] = callback(value, i, length);
              }
            }
          , enumerable   : true
          , configurable : false
          , writable     : false
      }
    });
  }

function checkBounds(requested, maxIndex, callerName) {

  if (requested < 0 || requested > maxIndex) {
    throw new IndexOutOfBounds(maxIndex, requested, callerName);
  }
}

function relativeIndex(index, start, length) {
  return (start + index) % length;
}

  return Ring;

}());