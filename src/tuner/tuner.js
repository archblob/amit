function Tuner() {

  if (Tuner.prototype._instance) {
    return Tuner.prototype._instance;
  }

  Tuner.prototype._instance = this;

  var context             = new AudioContext()
    , samplerate          = 44100
    , downsampleFactor    = 12
    , fftSize             = 2048
    , effectiveSamplerate = samplerate / downsampleFactor
    , frequencyResolution = effectiveSamplerate / fftSize
    , bufferSize          = fftSize * downsampleFactor
    , temporalWindow      = bufferSize / samplerate /* seconds */
    , harmonics           = 5
    , maxHarmFrequency    = fftSize / harmonics * frequencyResolution
    , fft                 = new FFT(fftSize, effectiveSamplerate)
    , samples             = new Ring(bufferSize, 512)
    , windowFunction      = new WindowObject("Hann", bufferSize)
    , frequencyMap        = new FrequencyMap()
    , viewCallback
    , requestDataType = { peek       : false
                        , spectrum   : false
                        , updateTime : false
                        }
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
      , respondData = {}
      ;

    windowFunction.process(samples);

    for (i = 0; i < samples.length ; i += downsampleFactor) {
      downsampled.push(samples.get(i));
    }

    fft.forward(downsampled);

    spectrum = fft.spectrum;
    peek     = HPS(spectrum,harmonics);

    if (requestDataType.peek) {
      respondData.peek = frequencyMap.closestNote(peek * frequencyResolution);
    }

    if (requestDataType.spectrum) {
      respondData.spectrum = spectrum;
    }

    viewCallback(respondData);
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
            lowpass.frequency  = (effectiveSamplerate / 2).toFixed(3);
            highpass.frequency = 35;
        }
      },
      "samplerate" : {
          value        : samplerate
        , enumerable   : true
        , configurable : false
        , writable     : false
      }
    , "viewCallback" : {
          enumerable   : false
        , configurable : false
        , set : function (clbk) {
          viewCallback = clbk;

          if (requestDataType.updateTime) {
            viewCallback({ updateTime : temporalWindow });
          }
        }
      }
    , "requestDataType" : {
          enumerable   : true
        , configurable : false
        , set : function (rdata){
            requestDataType = rdata;
        }
        , get : function () {
            return requestDataType;
        }
    }
    , "downsampleFactor" : {
          enumerable   : true
        , configurable : false
        , get : function () {
            return downsampleFactor;
          }
        , set : function (value) {

            checkNat("downsampleFactor",value);

            downsampleFactor = Math.floor(value);

            effectiveSamplerate = samplerate / downsampleFactor;
            frequencyResolution = effectiveSamplerate / fftSize;
            bufferSize       = fftSize * downsampleFactor;
            temporalWindow   = bufferSize / samplerate;
            maxHarmFrequency = fftSize / harmonics * frequencyResolution;

            fft     = new FFT(fftSize, effectiveSamplerate);
            samples = new Ring(bufferSize, 512);

            lowpass.frequency  = (effectiveSamplerate / 2).toFixed(3);

            windowFunction.length = bufferSize;

            if (requestDataType.updateTime) {
              viewCallback({ updateTime : temporalWindow });
            }
          }
      }
    , "fftSize" : {
          enumerable   : true
        , configurable : false
        , get : function () {
            return fftSize;
          }
        , set : function (value) {
            fftSize = value;

            frequencyResolution = effectiveSamplerate / fftSize;
            bufferSize       = fftSize * downsampleFactor;
            temporalWindow   = bufferSize / samplerate;
            maxHarmFrequency = fftSize / harmonics * frequencyResolution;

            /* this will throw an exception if the fft size is not valid */
            fft     = new FFT(fftSize, effectiveSamplerate);
            samples = new Ring(bufferSize, 512);

            windowFunction.length = bufferSize;

            if (requestDataType.updateTime) {
              viewCallback({ updateTime : temporalWindow });
            }
          }
      }
    , "effectiveSamplerate" : {
          enumerable   : true
        , configurable : false
        , get : function () {
            return effectiveSamplerate;
          }
      }
    , "frequencyResolution" : {
          enumerable   : true
        , configurable : false
        , get : function () {
            return frequencyResolution;
          }
      }
    , "temporalWindow" : {
          enumerable   : true
        , configurable : false
        , get : function () {
            return temporalWindow;
          }
      }
    , "frequencyMap" : {
          enumerable   : false
        , configurable : false
        , get : function () {
            return frequencyMap;
          }
        , set : function (freqMap) {

            if (freqMap.hasOwnProperty("closestNote")) {
              frequencyMap   = freqMap;
            } else {
              throw new TypeError("Passed object has to " +
                                  "implement method closestNote");
            }
          }
      }
    , "harmonics" : {
          enumerable   : true
        , configurable : false
        , get : function () {
            return harmonics;
          }
        , set : function (value) {

            checkNat("downsampleFactor",value);

            harmonics        = value;
            maxHarmFrequency = fftSize / harmonics * frequencyResolution;

          }
      }
    , "maxDetectableFundamental" : {
          enumerable   : true
        , configurable : false
        , get : function () {
            return maxHarmFrequency;
        }
    }
    , "run" : {
          value : function () {

            if (!source) {
              throw new ReferenceError("The audio stream is not set.");
            }

            if (!viewCallback) {
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
                                     , temporalWindow.toFixed(3) * 1000);
        }
        , enumerable   : false
        , configurable : false
        , writable     : false
    }
  });

}