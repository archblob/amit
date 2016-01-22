(function (global) {


/*
 * Copyright (c) 2013 Csernik Flaviu Andrei
 *
 * See the file LICENSE.txt for copying permission.
 * 
 */

"use strict";

window.AudioContext = window.AudioContext || window.webkitAudioContext;

function PropertyNotInitialized(obj, propName) {
  this.property = propName;
  this.obj      = obj;
}

PropertyNotInitialized.prototype.toString = function () {
  return this.obj + " : " + this.property + " not initialized.";
};

function isInteger(n) {
   return typeof n === "number" && Math.floor(n) == n;
}

function checkNat(callerName, n) {

  if (!isInteger || value < 1) {
    throw new TypeError("downsampleFactor must be a natural number." +
                         "given value is not: " + value);
  }

}

var Ring = (function () {

  function IndexOutOfBounds(maxIndex, requestedIndex, method) {
    this.maxIndex       = maxIndex;
    this.requestedIndex = requestedIndex;
    this.method         = method;
  }

  IndexOutOfBounds.prototype.toString = function () {
    return "Invalid index in method ['" + this.method + "']\n" +
           "Requested index    : " + this.requestedIndex +
           "\nValid buffer index : [0.." + this.maxIndex + "]";
  };

  function ImproperBlockLength(ringBlockLength, givenBlockLength) {
    this.ringBlockLength  = ringBlockLength;
    this.givenBlockLength = givenBlockLength;
  }

  ImproperBlockLength.prototype.toString = function () {
    return "Block length mismatch.\n" +
           "Requeste block length : " + this.givenBlockLength + "\n" +
           "Valid block length    : " + this.ringBlockLength;
  };

  function Ring(len, blockLen) {
    
    var length      = len
      , maxIndex    = length - 1
      , start       = 0
      , buffer      = new Float32Array(length)
      , blockLength = 0
      ;

    /* blockLength should always be a factor of size.
     * An exception is thrown if it's not;
     */
    blockLength = 0;

    if (blockLen) {

      if (len % blockLen !== 0) {
        throw "Block length must be a factor of length.";
      }

      blockLength = blockLen;

    }

    Object.defineProperties(this, {
        "length" : {
            value        : length
          , enumerable   : true
          , configurable : false
          , writable     : false
      }
      , "blockLength" : {
            value        : blockLength
          , enumerable   : true
          , configurable : false
          , writable     : false
      }
    });

    Object.defineProperties(Ring.prototype, {
        "get" : {
            value : function (index) {
              checkBounds(index, maxIndex, 'get');

              return buffer[relativeIndex(index, start, length)];
          }
          , enumerable   : true
          , configurable : false
          , writable     : false
      }
      , "set" : {
           value : function (index, value) {

             checkBounds(index, maxIndex, 'set');

             buffer[relativeIndex(index, start, length)] = value;
          }
         , enumerable   : true
         , configurable : false
         , writable     : false
      }
      , "concat" : {
            value : function (arr) {

              var alen = arr.length
                , nlen = start + alen
                ;

              if (alen !== blockLength) {
                throw new ImproperBlockLength(blockLength, alen);
              }

              buffer.set(arr, start);

              if (start + alen >= length) {
                  start = 0;
              } else {
                  start = nlen;
              }
          }
          , enumerable   : true
          , configurable : false
          , writable     : false
      }
      , "map" : {
            value : function (callback) {

              var relIndex
                , value
                , i
                ;

              for (i = 0; i < length; i += 1) {
                relIndex = relativeIndex(i, start, length);
                value = buffer[relIndex];

                buffer[relIndex] = callback(value, i, length);
              }
          }
          , enumerable   : true
          , configurable : false
          , writable     : false
      }
    });
  }

function checkBounds(requested, maxIndex, callerName) {

  if (requested < 0 || requested > maxIndex) {
    throw new IndexOutOfBounds(maxIndex, requested, callerName);
  }
}

function relativeIndex(index, start, length) {
  return (start + index) % length;
}

  return Ring;

}());

var FrequencyMap = (function () {

  /* 12-TET(12 Tone Equal Tempered scale */
  /* reference frequency default is A4 440 Hz*/

  var notes = ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"]
    , trtwo = Math.pow(2, 1 / 12)
    ;

  function populateFrequencyMap(reference, length) {

    var frequencyMap = []
      , i
      ;

    for (i = 1; i <= length; i += 1) {

      frequencyMap[i - 1] = {
        frequency : reference * Math.pow(trtwo, i - 49),
        name      : notes[(i + 8) % 12] + Math.floor((i + 8) / 12)
      };
    }

    return frequencyMap;
  }

  function FrequencyMap() {

    var _A4     = 440
      , _length = 88
      , _frequencyMap = populateFrequencyMap(_A4, _length);

    Object.defineProperties(this, {
        "A4" : {
            enumerable   : true
          , configurable : false
          , get : function () {
              return _A4;
          }
          , set : function (value) {

              checkNat("A4", value);

              _A4 = value;

              _frequencyMap = populateFrequencyMap(_A4, _length);

          }
        }
      , "length" : {
          value        : _length
        , enumerable   : true
        , configurable : false
        , writable     : false
      }
      , "frequencyMap" : {
          value        : _frequencyMap
        , enumerable   : true
        , configurable : false
        , writable     : false
      }
    });
  }

  Object.defineProperty(FrequencyMap.prototype, "closestNote", {
      value : function (freq) {
        /* Do a binary search on the frequency array and
         * return closest match;
         */

        if (!this.A4) {
          throw new ReferenceError("Please set a reference frequency on the " +
                                    "FrequencyMap object.");
        }

        var closestNote = this.frequencyMap[0]
          , min = 0
          , max = this.length - 1
          , mid = 0
          , midFreq = 0
          ;

        while (min <= max) {

          mid     = (max + min) >> 1;
          midFreq = this.frequencyMap[mid].frequency;

          if (midFreq < freq) { min = mid + 1; }
          if (midFreq > freq) { max = mid - 1; }

        }

        var succ  = mid + 1
          , pred  = mid - 1
          , midDiff   = Math.abs(freq - midFreq)
          , succFreq  = 0
          , succDiff  = 0
          , predFreq  = 0
          , predDiff  = 0
          ;

        if (succ >= 0 && succ < this.length) {
          succFreq = this.frequencyMap[succ].frequency;
          succDiff = Math.abs(freq - succFreq);
        }

        if (pred >= 0 && pred < this.length) {
          predFreq = this.frequencyMap[pred].frequency;
          predDiff = Math.abs(freq - predFreq);
        }

        if (succFreq && (midDiff > succDiff)) {
          closestNote = this.frequencyMap[mid + 1];
        } else if (predFreq && (midDiff > predDiff)) {
          closestNote = this.frequencyMap[mid - 1];
        } else {
          closestNote = this.frequencyMap[mid];
        }

        var cents = 1200 * (Math.log(freq / closestNote.frequency) / Math.log(2));

        var note = {
            "note"      : closestNote
          , "cents"     : cents
          , "frequency" : freq
        };

        return note;

      }
    , enumerable   : true
    , configurable : false
    , writable     : false
  });

  return FrequencyMap;

}());

var WindowObject = (function () {

  var twoPI = 2 * Math.PI;

  function windowHann(i, length) {

    return 0.5 * (1 - Math.cos(twoPI * i / (length - 1)));

  }

  function windowHamming(i, length) {

    return 0.54 - 0.46 * Math.cos(twoPI * i / (length - 1));

  }

  function selectWindowFunctionType(type) {

    switch (type) {
    case "Hamming":
      return windowHamming;
    case "Hann":
      return windowHann;
    case undefined:
      throw new ReferenceError("No window function type selected.");
    default:
      throw new ReferenceError("Unknown window function " + type);
    }
  }

  function WindowFunction(tp, len) {

    var type           = tp
      , length         = len
      , values         = new Float32Array(length)
      , windowFunction = selectWindowFunctionType(type)
      , i
      ;

    for (i = 0; i < length; i += 1) {
      values[i] = windowFunction(i, length);
    }

    Object.defineProperties(this, {
        "type" : {
            enumerable   : true
          , configurable : false
          , get : function () {

              if (!type) {
                throw new PropertyNotInitialized("WindowFunction", "type");
              }

              return type;
          }
          , set : function (tp) {

              var i;

              type = tp;
              windowFunction = selectWindowFunctionType(tp);

              if (length) {
                for (i = 0; i < length; i += 1) {
                  values[i] = windowFunction(i, length);
                }
              } else {
                throw new PropertyNotInitialized("WindowFunction", "length");
              }
          }
      }
      , "length" : {
            enumerable   : true
          , configurable : false
          , get : function () {

              if (!length) {
                throw new PropertyNotInitialized("WindowFunction", "length");
              }

              return length;
            }
          , set : function (value) {

              var i;

              length = value;
              values = new Float32Array(length);

              if (type) {
                for (i = 0; i < length; i += 1) {
                  values[i] = windowFunction(i, length);
                }
              } else {
                throw new PropertyNotInitialized("WindowFunction", "type");
              }
         }
      }
    });

    Object.defineProperty(WindowFunction.prototype, "process", {
        value : function (buffer) {

          if (!length) {
            throw new PropertyNotInitialized("WindowFunction", "length");
          }

          if (!type) {
            throw new PropertyNotInitialized("WindowFunction", "type");
          }

          if (buffer.length !== length) {
            throw new TypeError("Given buffer is not the same length as" +
                                " the length property of WindowFunction." +
                                "\nExpected : " + length +
                                "\nGiven    : " + buffer.length
                                );
          }

          buffer.map(function (v, i) { return v * values[i]; });

      }
      , enumerable   : true
      , configurable : false
      , writable     : false
    });
  }

  return WindowFunction;

}());

function HPS(spectrum, harmonics) {

  var peek = 1
    , i
    , j
    ;

  for (i = 1; i <= (spectrum.length/harmonics); i += 1) {

    for (j = 1; j < harmonics; j += 1) {
      spectrum[i] *= spectrum[i * j];
    }

    if (spectrum[i] > spectrum[peek]) {
      peek = i;
    }

  }

  return peek;
}

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
    , startID
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

            lowpass.type  = "lowpass";
            highpass.type = "highpass";

            lowpass.frequency.value  = (effectiveSamplerate / 2).toFixed(3);
            highpass.frequency.value = 35;
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
    , "start" : {
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

            startID = window.setInterval( fundamental
                                        , temporalWindow.toFixed(3) * 1000);
        }
        , enumerable   : false
        , configurable : false
        , writable     : false
    }
    , "pause" : {
        value : function () {

          if (startID) {
            window.clearInterval(startID);

            source.disconnect(0);
            lowpass.disconnect(0);
            highpass.disconnect(0);
            processor.disconnect(0);
          } 

        }
      , enumerable   : false
      , configurable : false
      , writable     : false
    }
  });

}
global.Tuner = Tuner;
}(window));
