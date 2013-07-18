/*
 * Copyright (c) 2013 Csernik Flaviu Andrei
 *
 * See the file LICENSE.txt for copying permission.
 * 
 */

(function (global) {

  /* 12-TET(12 Tone Equal Tempered scale */
  /* reference frequency default is A4 440 Hz*/

  "use strict";

  var notesDiez  = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    , notesBemol = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]
    , trtwo      = Math.pow(2, 1 / 12)
    ;

  function populateFrequencyMap(reference, length) {

    var frequencyMap = []
      , i
      ;

    for (i = 1; i <= length; i += 1) {

      frequencyMap[i - 1] = {
        frequency : reference * Math.pow(trtwo, i - 49),
        name      : notesDiez[(i + 8) % 12] + Math.floor((i + 8) / 12)
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
            /* TODO check that values is and integer */
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
          , cents = 1200 * (Math.log(freq / closestNote.frequency) / Math.log(2))
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

  global.FrequencyMap = FrequencyMap;

}(window));