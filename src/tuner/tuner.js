var Tuner = (function () {

  function Tuner() {

    if (Tuner.prototype._instance) {
      return Tuner.prototype._instance;
    }

    Tuner.prototype._instance = this;

    var context              = new AudioContext()
      , _samplerate          = 44100
      , _downsampleFactor    = 12
      , _fftSize             = 2048
      , _effectiveSamplerate = _samplerate / _downsampleFactor
      , _frequencyResolution = _effectiveSamplerate / _fftSize
      , _bufferSize          = _fftSize * _downsampleFactor
      , _temporalWindow      = _bufferSize / _samplerate
      , _harmonics           = 5
      , _maxHarmFrequency    = _fftSize / _harmonics * _frequencyResolution
      , fft                  = new FFT(_fftSize, _effectiveSamplerate)
      , samples              = new Ring(_bufferSize, 512)
      , _windowFunction      = new WindowObject("Hann", _bufferSize)
      , _frequencyMap        = new FrequencyMap()
      , _viewCallback
      ;

    var source
      , lowpass
      , highpass
      , processor
      ;

    function fundamental() {

      var downsampled = []
        , spectrum
        , peek
        , i
        ;

      _windowFunction.process(samples);

      for (i = 0; i < samples.length ; i += _downsampleFactor) {
        downsampled.push(samples.get(i));
      }

      fft.forward(downsampled);

      spectrum = fft.spectrum;
      peek     = HPS(spectrum,_harmonics);

      _viewCallback({
        peek : _frequencyMap.closestNote(peek * _frequencyResolution),
        spectrum : spectrum
      });
    }

    Object.defineProperties(this, {
        "setAudioStream": {
            enumebrable  : false
          , configurable : false
          , set: function (stream) {
              source    = context.createMediaStreamSource(stream);
              lowpass   = context.createBiquadFilter();
              highpass  = context.createBiquadFilter();
              processor = context.createScriptProcessor(512,1,1);

              lowpass.type       = "lowpass";
              highpass.type      = "highpass";
              lowpass.frequency  = (_effectiveSamplerate / 2).toFixed(3);
              highpass.frequency = 35;
          }
        },
        "samplerate" : {
            value        : _samplerate
          , enumerable   : true
          , configurable : false
          , writable     : false
        }
      , "viewCallback" : {
            enumerable   : false
          , configurable : false
          , set : function (clbk) {
            _viewCallback = clbk;

            _viewCallback({ updateTime : _temporalWindow });
          }
        }
      , "downsampleFactor" : {
            enumerable   : true
          , configurable : false
          , get : function () {
              return _downsampleFactor;
            }
          , set : function (value) {

              checkNat("downsampleFactor",value);

              _downsampleFactor = Math.floor(value);

              _effectiveSamplerate = _samplerate / _downsampleFactor;
              _frequencyResolution = _effectiveSamplerate / _fftSize;
              _bufferSize       = _fftSize * _downsampleFactor;
              _temporalWindow   = _bufferSize / _samplerate;
              _maxHarmFrequency = _fftSize / _harmonics * _frequencyResolution;

              fft     = new FFT(_fftSize, _effectiveSamplerate);
              samples = new Ring(_bufferSize, 512);

              lowpass.frequency  = (_effectiveSamplerate / 2).toFixed(3);

              _windowFunction.length = _bufferSize;

              _viewCallback({ updateTime : _temporalWindow });
            }
        }
      , "fftSize" : {
            enumerable   : true
          , configurable : false
          , get : function () {
              return _fftSize;
            }
          , set : function (value) {
              _fftSize = value;

              _frequencyResolution = _effectiveSamplerate / _fftSize;
              _bufferSize       = _fftSize * _downsampleFactor;
              _temporalWindow   = _bufferSize / _samplerate;
              _maxHarmFrequency = _fftSize / _harmonics * _frequencyResolution;

              /* this will throw an exception if the fft size is not valid */
              fft     = new FFT(_fftSize, _effectiveSamplerate);
              samples = new Ring(_bufferSize, 512);

              _windowFunction.length = _bufferSize;

              _viewCallback({ updateTime : _temporalWindow });
            }
        }
      , "effectiveSamplerate" : {
            enumerable   : true
          , configurable : false
          , get : function () {
            return _effectiveSamplerate;
            }
        }
      , "frequencyResolution" : {
            enumerable   : true
          , configurable : false
          , get : function () {
              return _frequencyResolution;
            }
        }
      , "temporalWindow" : {
            enumerable   : true
          , configurable : false
          , get : function () {
              return _temporalWindow;
            }
        }
      , "frequencyMap" : {
            enumerable   : false
          , configurable : false
          , get : function () {
              return _frequencyMap;
            }
          , set : function (freqMap) {

              if (freqMap.hasOwnProperty("closestNote")) {
                _frequencyMap   = freqMap;
              } else {
                throw new TypeError("Passed object has to have " +
                                    "a method named closestNote");
              }
            }
        }
      , "harmonics" : {
            enumerable   : true
          , configurable : false
          , get : function () {
              return _harmonics;
            }
          , set : function (value) {

              checkNat("downsampleFactor",value);

              _harmonics        = value;
              _maxHarmFrequency = _fftSize / _harmonics * _frequencyResolution;

            }
        }
      , "maxDetectableFundamental" : {
            enumerable   : true
          , configurable : false
          , get : function () {
              return _maxHarmFrequency;
          }
      }
      , "run" : {
            value : function () {

              if (!source) {
                throw new ReferenceError("The audio stream is not set.");
              }

              if (!_viewCallback) {
                throw new PropertyNotInitialized("Tuner", "callback");
              }

              processor.onaudioprocess = function (event) {
              var input = event.inputBuffer.getChannelData(0);

              samples.concat(input);

              event.outputBuffer.getChannelData(0).set(input);
              };

              source.connect(lowpass);
              lowpass.connect(highpass);
              highpass.connect(processor);
              processor.connect(context.destination);

              return window.setInterval(fundamental
                                       , _temporalWindow.toFixed(3) * 1000);
          }
          , enumerable   : false
          , configurable : false
          , writable     : false
      }
    });

  }

  return Tuner;
}());
