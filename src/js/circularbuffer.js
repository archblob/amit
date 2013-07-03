/* Fixed size queue implemented as a circular array */

function Ring(size) {
  this.length   = size;
  this.maxIndex = this.length - 1;
  this.start    = 0;
  this.buffer   = new Float32Array(this.length);
}

Ring.prototype.push = function (element) {
  
  this.buffer[this.start] = element;
  
  var newStart = this.start + 1;
  this.start = newStart > this.maxIndex ? 0 : newStart;
};

Ring.prototype.get = function (index) {

  /* do a bounds check before anything else */

  var relativeIndex = (this.start + index ) % this.length;

  return this.buffer[relativeIndex];
};
