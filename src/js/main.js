window.AudioContext =
  window.AudioContext || window.webkitAudioContext ||
  window.mozAudioContext || window.msAudioContext;

navigator.getUserMedia =
  navigator.getUserMedia || navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia || navigator.msGetUserMedia;

if (window.AudioContext && navigator.getUserMedia){
  var myView  = new CentsView("centsView");
  var myTuner = new Tuner(myView);

  navigator.getUserMedia({audio : true},
    function(stream){ 
    myTuner.run(stream);
  },function(e){
    console.log(e);
  });
} else {
  alert("Web Audio not supported, please enable it or use another browser.");
}
