/* Inefficient Queue */
function IQueue() {
  this.queue = [];
}

IQueue.prototype.enqueue = function (element) {
  this.queue.push(element);
};

IQueue.prototype.dequeue = function () {
  return this.queue.shift();
};