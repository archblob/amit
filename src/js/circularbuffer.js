(function (global) {

  "use strict";

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

  function Ring(length, blockLength) {
    this.length    = length;
    this._maxIndex = this.length - 1;
    this._start    = 0;
    this._buffer   = new Float32Array(this.length);

    /* blockLength should always be a factor of size.
     * An exception is thrown if it's not;
     */
    this._blockLength = 0;

    if (blockLength) {

      if (length % blockLength != 0) {
        throw "Block length must be a factor of length.";
      } else {
        this._blockLength = blockLength;
      }

    }
  }

  Ring.prototype.checkBounds = function (requested, callerName) {

    if (requested < 0 || requested > this._maxIndex)
      throw new IndexOutOfBounds(this._maxIndex, requested, callerName);
  };

  Ring.prototype.relativeIndex = function(index) {
    return (this._start + index) % this.length;
  };

  /* Should not be used when there is a set _blockLength */
  Ring.prototype.push = function (element) {
  
    this._buffer[this._start] = element;
  
    var newStart = this._start + 1;
    this._start = newStart > this._maxIndex ? 0 : newStart;
  };

  Ring.prototype.get = function (index) {

    this.checkBounds(index, 'get');

    return this._buffer[this.relativeIndex(index)];
  };

  Ring.prototype.set = function (index, value) {

    this.checkBounds(index, 'set');

    this._buffer[this.relativeIndex(index)] = value;
  
  };

  Ring.prototype.concat = function(arr) {

    var alen = arr.length;
    var blen = this._blockLength;

    if (alen != blen) {
      throw new ImproperBlockLength(blen, alen);
    }
  
    this._buffer.set(arr, this._start);
    this._start = (this._start + alen) % this.length;

  };

  Ring.prototype.map = function (callback) {

    var relativeIndex;
    var value;

    for(var i = 0 ; i < this.length ; i++) {
      relativeIndex = this.relativeIndex(i);
      value = this._buffer[relativeIndex];

      this._buffer[relativeIndex] = callback(value, i, this.length);
    }
  };

  global['Ring'] = Ring;

}(window));