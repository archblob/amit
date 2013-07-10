(function (global) {

  "use strict";

  function HPS(spectrum, harmonics) {

    var peek = 1;

    for (var i=1; i <= (spectrum.length/harmonics); i++) {
      for (var j = 1; j < harmonics; j++) {
          spectrum[i] *= spectrum[i*j];
      }

      if (spectrum[i] > spectrum[peek]) {
        peek = i;
      }
    }

    return peek;
  };
  
  function Tuner(callback) {

    var context = new AudioContext();
    
    var _samplerate = 44100;
    
    var _downsampleFactor    = 20;
    var _fftSize             = 512;
    var _effectiveSamplerate = _samplerate / _downsampleFactor;
    var _frequencyResolution = _effectiveSamplerate / _fftSize;
    var _bufferSize          = _fftSize * _downsampleFactor;
    var _temporalWindow      = _bufferSize / _samplerate;
    var _harmonics           = 3;
    
    var fft             = new FFT(_fftSize, _effectiveSamplerate);
    var samples         = new Ring(_bufferSize, 512);
    var _windowFunction = new WindowObject();
    var _frequencyMap   = new FrequencyMap();
    var _viewCallback   = callback;
    
    _windowFunction.type   = "Hann";
    _windowFunction.length = _bufferSize;

    Object.defineProperties(this, {
      "samplerate" : {
        value        : _samplerate,
        enumerable   : true,
        configurable : false,
        writable     : false
      },
      "viewCallback" : {
        value        : _viewCallback,
        enumerable   : true,
        configurable : false,
        writable     : true
      },
      "downsampleFactor" : {
        enumerable   : true,
        configurable : false,
        get : function () {
          return _downsampleFactor;
        },
        set : function (value) {

          _downsampleFactor = Math.floor(value);

          _effectiveSamplerate = _samplerate / _downsampleFactor;
          _frequencyResolution = _effectiveSamplerate / _fftSize;
          _bufferSize          = _fftSize * _downsampleFactor;
          _temporalWindow      = _bufferSize / _samplerate;

          fft     = new FFT(_fftSize, _effectiveSamplerate);
          samples = new Ring(_bufferSize, 512);

          _windowFunction.length = _bufferSize;
        }
      },
      "fftSize" : {
        enumerable   : true,
        configurable : false,
        get : function () {
          return _fftSize;
        },
        set : function (value) {
          /* TODO : check to see if it is valid fft size */
          _fftSize = value;

          _frequencyResolution = _effectiveSamplerate / _fftSize;
          _bufferSize          = _fftSize * _downsampleFactor;
          _temporalWindow      = _bufferSize / _samplerate;

          fft     = new FFT(_fftSize, _effectiveSamplerate);
          samples = new Ring(_bufferSize, 512);

          _windowFunction.length = _bufferSize;
        }
      },
      "effectiveSamplerate" : {
        enumerable   : true,
        configurable : false,
        get : function () {
          return _effectiveSamplerate;
        }
      },
      "frequencyResolution" : {
        enumerable   : true,
        configurable : false,
        get : function () {
          return _frequencyResolution;
        }
      },
      "temporalWindow" : {
        enumerable   : true,
        configurable : false,
        get : function () {
          return _temporalWindow;
        }
      },
      "frequencyMap" : {
        enumerable   : true,
        configurable : false,
        get : function () {
          return _frequencyMap;
        },
        set : function (freqMap) {
          /* TODO check if it is really a FrequencyMap type */
          _frequencyMap   = freqMap;
        }
      },
      "harmonics" : {
        enumerable   : true,
        configurable : false,
        get : function () {
          return _harmonics;
        },
        set : function (value) {
          /* TODO check if it is a valid number */
          _harmonics   = value;
        }
      }
    });

    Object.defineProperties(Tuner.prototype, {
      "fundamental" : {
        value : function () {

          _windowFunction.process(samples);

          var downsampled = [];

          for (var i=0; i < samples.length ; i += _downsampleFactor) {
            downsampled.push(samples.get(i));
          }

          fft.forward(downsampled);

          var spectrum = fft.spectrum;
          var peek     = HPS(spectrum,_harmonics);


          _viewCallback({
              peek : _frequencyMap.closestNote(peek * _frequencyResolution),
              spectrum : spectrum
          });
        },
        enumerable   : false,
        configurable : false,
        writable     : false
      },
      "run" : {
        value : function (stream) {
          /* TODO check for view callback */

          var source    = context.createMediaStreamSource(stream);
          var lowpass   = context.createBiquadFilter();
          var highpass  = context.createBiquadFilter();
          var processor = context.createScriptProcessor(512,1,1);

          lowpass.type       = "lowpass";
          highpass.type      = "highpass";
          lowpass.frequency  = (_effectiveSamplerate / 2).toFixed(3);
          highpass.frequency = 35;

          processor.onaudioprocess = function (event) {
            var input = event.inputBuffer.getChannelData(0);

            samples.concat(input);

            event.outputBuffer.getChannelData(0).set(input);
          };

          source.connect(lowpass);
          lowpass.connect(highpass);
          highpass.connect(processor);
          processor.connect(context.destination);

          return window.setInterval(this.fundamental,
                                    _temporalWindow.toFixed(3) * 1000);

        },
        enumerable   : false,
        configurable : false,
        writable     : false,
      }
    });
    
  }

  global["Tuner"] = Tuner;

}(window));