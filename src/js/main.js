window.AudioContext =
  window.AudioContext || window.webkitAudioContext ||
  window.mozAudioContext || window.msAudioContext;

navigator.getUserMedia =
  navigator.getUserMedia || navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia || navigator.msGetUserMedia;

if (window.AudioContext && navigator.getUserMedia){

  navigator.getUserMedia({audio : true},
    function(stream){ 
      var centsView = new CentsView("centsView");
      centsView.run();
      var worker    = new Worker("js/tuner.js");

      var samplerate = 44100 / 20;
      var windowSize = 512;
      var fftSize    = 512;
      var bufferSize = 512 * 20;
      var tWindow    = bufferSize / 44100;

      var samples = new Float32Array(bufferSize);
      var context = new AudioContext();

      var source    = context.createMediaStreamSource(stream);
      var lowpass   = context.createBiquadFilter();
      var highpass  = context.createBiquadFilter();
      var processor = context.createScriptProcessor(windowSize,1,1);

      lowpass.type       = "lowpass";
      highpass.type      = "highpass";
      lowpass.frequency  = (samplerate / 2).toFixed(3);
      highpass.frequency = 35;

      processor.onaudioprocess = function(event) {
        var input = event.inputBuffer.getChannelData(0);

        for(var i = input.length ; i < bufferSize ; i++){
          samples[i - fftSize] = samples[i];
        }

        for(var i = 0 ; i < input.length ; i++){
          samples[samples.length - fftSize + i] = input[i];
        }

        event.outputBuffer.getChannelData(0).set(input);
      };

      worker.onmessage = function(event){
        var peek        = event.data.peek;
        var lastCents   = centsView.lastCents;
        var scaledCents = Math.floor(peek.cents / 50 * centsView.quadrantArc);
        var step = (scaledCents - lastCents) / Math.abs(scaledCents - lastCents);
        var st;

        function condition(i){
          if (lastCents < scaledCents){
            return i < scaledCents;
          } else {
             return i > scaledCents;
          }
        }

        function loop(){
          if(condition(lastCents)){
            peek.cents = lastCents;
            centsView.update(peek);
             lastCents += step;
          } else {
            window.clearInterval(st);
          }
        }

        st = window.setInterval(function(){ loop();},1);
      };

      source.connect(lowpass);
      lowpass.connect(highpass);
      highpass.connect(processor);
      processor.connect(context.destination);

      window.setInterval(function(){ worker.postMessage({ current: samples}); },
                         tWindow.toFixed(3) * 1000);
  },function(e){
    console.log(e);
  });
} else {
  alert("Web Audio not supported, please enable it or use another browser.");
}
