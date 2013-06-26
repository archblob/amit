function IndexOutOfBounds(maxIndex, requestedIndex, method) {

  this.maxIndex       = maxIndex;
  this.requestedIndex = requestedIndex;
  this.method         = method;

  this.toString = function () {
    return "Invalid index in method ['" + this.method + "']\n" +
           "Requested index           : " + this.requestedIndex + "\n" +
           "Valid 'BlockBuffer' index : " + "[0.." + this.maxIndex + "]";
  };
}

function ImproperBlockLength(bufferBlockLength, givenBlockLength) {
  this.bufferBlockLength = bufferBlockLength;
  this.givenBlockLength  = givenBlockLength;

  this.toString = function () {
    return "Block length mismatch.\n" +
           "Requeste block length : " + this.givenBlockLength  + "\n" +
           "Valid block length    : " + this.bufferBlockLength;
  };
}

function BlockBuffer(blockSize, blocks) {

  this.blockSize = blockSize;
  this.blocks    = blocks;
  this.length    = blockSize * blocks;

  this.buffer = new Array(blocks);

  for (var i = 0 ; i < blocks ; i++) {
    this.buffer[i] = new Float32Array(blockSize);
  }
}

BlockBuffer.prototype.get = function (i) {

  var relativeIndex = i % this.blockSize;
  var blockIndex    = Math.floor(i / this.blockSize);

  if (i < 0 || i > this.length - 1) {
    throw new IndexOutOfBounds(this.length - 1, i, 'get');
  } else {
    return this.buffer[blockIndex][relativeIndex];
  }

};

BlockBuffer.prototype.set = function (i,v) {

  var relativeIndex = i % this.blockSize;
  var blockIndex    = Math.floor(i / this.blockSize);

  if (i < 0 || i > this.length - 1) {
    throw new IndexOutOfBounds(this.length - 1, i, 'set');
  } else {
    this.buffer[blockIndex][relativeIndex] = v;
  }

};

BlockBuffer.prototype.addBlock = function (block) {

    var blength = block.length;

    if (blength < this.blockSize || blength > this.blockSize) {
        throw new ImproperBlockLength(this.blockSize, blength);
    } else {
        for (var i = 1; i < this.length ; i++) {
            this.buffer[i-1] = this.buffer[i];
        }
        
        this.buffer[blocks - 1] = block;
    }

};

BlockBuffer.prototype.map = function (callback) {

  var value;
  var relativeIndex;
  
  for (var i = 0 ; i < this.blocks; i++) {
    for (var j = 0 ; j < this.blockSize; j++) {

      value         = this.buffer[i][j];
      relativeIndex = this.blockSize * i + j;
      
      this.buffer[i][j] = callback(value, relativeIndex, this.length);

    }
  }

};
