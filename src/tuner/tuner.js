/*
 * Copyright (c) 2013 Csernik Flaviu Andrei
 *
 * See the file LICENSE.txt for copying permission.
 * 
 */

(function (global) {

  "use strict";

  function Tuner(callback) {

    var context              = new AudioContext()
      , _samplerate          = 44100
      , _downsampleFactor    = 12
      , _fftSize             = 2048
      , _effectiveSamplerate = _samplerate / _downsampleFactor
      , _frequencyResolution = _effectiveSamplerate / _fftSize
      , _bufferSize          = _fftSize * _downsampleFactor
      , _temporalWindow      = _bufferSize / _samplerate
      , _harmonics           = 5
      , fft                  = new FFT(_fftSize, _effectiveSamplerate)
      , samples              = new Ring(_bufferSize, 512)
      , _windowFunction      = new WindowObject()
      , _frequencyMap        = new FrequencyMap()
      , _viewCallback        = callback
      ;

      _windowFunction.type   = "Hann";
      _windowFunction.length = _bufferSize;

    Object.defineProperties(this, {
        "samplerate" : {
            value        : _samplerate
          , enumerable   : true
          , configurable : false
          , writable     : false
        }
      , "viewCallback" : {
            value        : _viewCallback
          , enumerable   : true
          , configurable : false
          , writable     : true
        }
      , "downsampleFactor" : {
            enumerable   : true
          , configurable : false
          , get : function () {
              return _downsampleFactor;
            }
          , set : function (value) {

              _downsampleFactor = Math.floor(value);

              _effectiveSamplerate = _samplerate / _downsampleFactor;
              _frequencyResolution = _effectiveSamplerate / _fftSize;
              _bufferSize          = _fftSize * _downsampleFactor;
              _temporalWindow      = _bufferSize / _samplerate;

              fft     = new FFT(_fftSize, _effectiveSamplerate);
              samples = new Ring(_bufferSize, 512);

              _windowFunction.length = _bufferSize;
            }
        }
      , "fftSize" : {
            enumerable   : true
          , configurable : false
          , get : function () {
              return _fftSize;
            }
          , set : function (value) {
              /* TODO : check to see if it is valid fft size */
              _fftSize = value;

              _frequencyResolution = _effectiveSamplerate / _fftSize;
              _bufferSize          = _fftSize * _downsampleFactor;
              _temporalWindow      = _bufferSize / _samplerate;

              fft     = new FFT(_fftSize, _effectiveSamplerate);
              samples = new Ring(_bufferSize, 512);

              _windowFunction.length = _bufferSize;
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
            enumerable   : true
          , configurable : false
          , get : function () {
              return _frequencyMap;
            }
          , set : function (freqMap) {
              /* TODO check if it is really a FrequencyMap type */
              _frequencyMap   = freqMap;
            }
        }
      , "harmonics" : {
            enumerable   : true
          , configurable : false
          , get : function () {
              return _harmonics;
            }
          , set : function (value) {
              /* TODO check if it is a valid number */
              _harmonics   = value;
            }
        }
    });

    Object.defineProperties(Tuner.prototype, {
        "fundamental" : {
            value : function () {

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
          , enumerable   : false
          , configurable : false
          , writable     : false
        }
      , "run" : {
            value : function (stream) {
              /* TODO check for view callback */

              var source    = context.createMediaStreamSource(stream)
                , lowpass   = context.createBiquadFilter()
                , highpass  = context.createBiquadFilter()
                , processor = context.createScriptProcessor(512,1,1)
                ;

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

            }
          , enumerable   : false
          , configurable : false
          , writable     : false
        }
    });

  }

  global.Tuner = Tuner;

}(window));