window.AudioContext =
  window.AudioContext || window.webkitAudioContext ||
  window.mozAudioContext || window.msAudioContext;

navigator.getUserMedia =
  navigator.getUserMedia || navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia || navigator.msGetUserMedia;

if (window.AudioContext && navigator.getUserMedia){

  navigator.getUserMedia({audio : true},
    function (stream) {

      var view     = new CentsView("viewContainer");
      var tuner    = new Tuner(view.update.bind(view));

      view.run();
      tuner.run(stream);

  }, function (e) {
    console.log(e);
  });
} else {
  alert("Web Audio not supported, please enable it or use another browser.");
}
