window.AudioContext =
  window.AudioContext || window.webkitAudioContext ||
  window.mozAudioContext || window.msAudioContext;

navigator.getUserMedia =
  navigator.getUserMedia || navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia || navigator.msGetUserMedia;

if (window.AudioContext && navigator.getUserMedia){

  navigator.getUserMedia({audio : true},
    function(stream){
      var readings = new IQueue();
      var tuner    = new Tuner(readings.enqueue.bind(readings));
      var view     = new CentsView("view", readings.dequeue.bind(readings));
      
      view.run();
      tuner.run(stream);
      view.update();
  },function(e){
    console.log(e);
  });
} else {
  alert("Web Audio not supported, please enable it or use another browser.");
}
