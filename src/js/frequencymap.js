/* 12-TET(12 Tone Equal Tempered scale */
/* reference frequency default is A4 440 Hz*/

(function (global) {

  "use strict";

  var notesDiez  = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  var notesBemol = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
  var trtwo = Math.pow(2,1/12);

  function populateFrequencyMap (reference,length) {

    var frequencyMap = [];

    for (var i = 1 ; i <= length ; i++) {
    
      frequencyMap[i-1] = {
         frequency : reference * Math.pow(trtwo, i - 49),
         name      : notesDiez[ (i + 8) % 12] + Math.floor((i + 8) / 12)
      };
    }

    return frequencyMap;
  }
  
  function FrequencyMap() {
    var _A4     = 440;
    var _length = 88;

    var _frequencyMap = populateFrequencyMap(_A4, _length);

    Object.defineProperties(this,{
      "A4" : {
        enumerable   : true,
        configurable : false,
        get : function () {
          return _A4;
        },
        set : function (value) {
          /* TODO check that values is and integer */
          _A4 = value;

          _frequencyMap = populateFrequencyMap(_A4,_length);

        }
      },
      "length" : {
        value        : _length,
        enumerable   : true,
        configurable : false,
        writable     : false
      },
      "frequencyMap" : {
        value        : _frequencyMap,
        enumerable   : true,
        configurable : false,
        writable     : false,
        
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

      var closestNote = this.frequencyMap[0];

      var min = 0;
      var max = this.length - 1;
      var mid = 0;
      var midFreq = 0;

      while (min <= max) {

        mid = (max + min) >> 1;
        midFreq     = this.frequencyMap[mid].frequency;

        if(midFreq < freq)  min = mid + 1;
        if(midFreq > freq)  max = mid - 1;

      }

      var succ = mid + 1;
      var pred = mid - 1;

      var midDiff  = Math.abs(freq - midFreq);
      var succFreq = 0;
      var succDiff = 0;
      var predFreq = 0;
      var predDiff = 0;

      if (succ >= 0 && succ < this.length) {
        succFreq = this.frequencyMap[succ].frequency;
        succDiff = Math.abs(freq - succFreq);
      }

      if (pred >= 0 && pred < this.length) {
        predFreq = this.frequencyMap[pred].frequency;
        predDiff = Math.abs(freq - predFreq);
      }

      if (succFreq && (midDiff > succDiff)){
        closestNote = this.frequencyMap[mid+1];
      } else if (predFreq && (midDiff > predDiff)) {
        closestNote = this.frequencyMap[mid-1];
      } else {
        closestNote = this.frequencyMap[mid];
      }

      var cents = 1200 * (Math.log(freq / closestNote.frequency) / Math.log(2));

      var note = {
        "note"      : closestNote,
        "cents"     : cents,
        "frequency" : freq
      };

      return note;

    },
    enumerable   : true,
    configurable : false,
    writable     : false
  });
  
  global["FrequencyMap"] = FrequencyMap;
  
}(window));