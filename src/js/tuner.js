/*
 * Since we are interested only in guitar tuning we don't bother
 * with anything higher than E6, even that is way to high, but i
 * thought that we can at least cover 24 frets.
 */
(function (global) {

  function Tuner(callback) {
    this.strSampleRate  = 44100;
    this.dsFactor       = 20;
    this.fftSize        = 512;
    this.samplerate     = this.strSampleRate / this.dsFactor;
    this.resolution     = this.samplerate / this.fftSize;
    this.bufferSize     = this.fftSize * this.dsFactor;
    this.windowSize     = 512;
    this.tWindow        = this.bufferSize / this.strSampleRate;
    this.frequencies    = new FrequencyMap();
  
    this.fft = new FFT(this.fftSize,this.samplerate);
    this.retCallback  = callback;
    this.samples      = new Ring(this.bufferSize, this.windowSize);
    this.windowFunction = new WindowObject();
  
    this.windowFunction.type   = "Hann";
    this.windowFunction.length = this.bufferSize;
    this.frequencies.A4 = 440;
  };
  
  Tuner.prototype.hps = function (spectrum, opt_h) {
    var opt_harmonics = 3;
  
    if (opt_h) {
      opt_harmonics = opt_h;
    }
  
    var peek = 1;
  
    for (var i=1; i < (spectrum.length/opt_harmonics); i++) {
      for (var j = 1; j < opt_harmonics; j++) {
          spectrum[i] *= spectrum[i*j];
      }
  
      if (spectrum[i] > spectrum[peek]) {
        peek = i;
      }
    }
  
    return peek;
  };
  
  Tuner.prototype.fundamental = function () {
    var step = this.dsFactor;
  
    this.windowFunction.process(this.samples);
  
    var downsampled = [];
  
    for (var i=0; i < this.samples.length ; i += step) {
      downsampled.push(this.samples.get(i));
    }
  
    this.fft.forward(downsampled);
  
    var spectrum = this.fft.spectrum;
    var peek     = this.hps(spectrum);
  
    this.retCallback({
        peek : this.frequencies.closestNote(peek*this.resolution),
        spectrum : spectrum
    });
  };
  
  Tuner.prototype.run = function (stream) {
    var context  = new AudioContext();
    
    var source    = context.createMediaStreamSource(stream);
    var lowpass   = context.createBiquadFilter();
    var highpass  = context.createBiquadFilter();
    var processor = context.createScriptProcessor(this.windowSize,1,1);
  
    lowpass.type       = "lowpass";
    highpass.type      = "highpass";
    lowpass.frequency  = (this.samplerate / 2).toFixed(3);
    highpass.frequency = 35;
  
    processor.onaudioprocess = function (event) {
      var input = event.inputBuffer.getChannelData(0);
  
      this.samples.concat(input);
  
      event.outputBuffer.getChannelData(0).set(input);
    }.bind(this);
  
    source.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(processor);
    processor.connect(context.destination);
    
    return window.setInterval(this.fundamental.bind(this),
                              this.tWindow.toFixed(3) * 1000);
  };

  global["Tuner"] = Tuner;

}(window));