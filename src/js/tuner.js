/*
 * Since we are interested only in guitar tuning we don't bother
 * with anything higher than E6, even that is way to high, but i
 * thought that we can at least cover 24 frets.
 */

var twoPI = 2 * Math.PI;

frequencies = [
  [41.20,"E1"],   [43.65,"F1"],
  [46.25,"F#1"],  [49.00,"G1"],
  [51.91,"G#1"],  [55.00,"A1"],
  [58.27,"A#1"],  [61.74,"B1"],
  [65.41,"C2"],   [69.30,"C#2"],
  [73.42,"D2"],   [77.78,"D#2"],
  [82.41,"E2"],   [87.31,"F2"],
  [92.50,"F#2"],  [98.00,"G2"],
  [103.83,"G#2"], [110.00,"A2"],
  [116.54,"A#2"], [123.47,"B2"],
  [130.81,"C3"],  [138.59,"C#3"],
  [146.83,"D3"],  [155.56,"D#3"],
  [164.81,"E3"],  [174.61,"F3"],
  [185.00,"F#3"], [196.00,"G3"],
  [207.65,"G#3"], [220.00,"A3"],
  [233.08,"A#3"], [246.94,"B3"],
  [261.63,"C4"],  [277.18,"C#4"],
  [293.66,"D4"],  [311.13,"D#4"],
  [329.63,"E4"],  [349.23,"F4"],
  [369.99,"F#4"], [392.00,"G4"],
  [415.30,"G#4"], [440.00,"A4"],
  [466.16,"A#4"], [493.88,"B4"],
  [523.25,"C5"],  [554.37,"C#5"],
  [587.33,"D5"],  [622.25,"D#5"],
  [659.26,"E5"],  [698.46,"F5"],
  [739.99,"F#5"], [783.99,"G5"],
  [830.61,"G#5"], [880.00,"A5"],
  [932.33,"A#5"], [987.77,"B5"],
  [1046.50,"C6"], [1108.73,"C#6"],
  [1174.66,"D6"], [1244.51,"D#6"],
  [1318.51,"E6"]
];

function windowHann(v,i,length) {
  var sc    = 0.5 * (1 - Math.cos(twoPI * i / (length - 1)));

  return v * sc;
}

function windowHamming(v,i,length) {

  var alfa = 0.54;
  var beta = 0.46; /* 1 - alfa */
  var sc   = alfa - beta * Math.cos(twoPI * i / (length - 1));

  return v * sc;
}

function Tuner(callback) {
  this.strSampleRate  = 44100;
  this.dsFactor       = 20;
  this.fftSize        = 512;
  this.samplerate     = this.strSampleRate / this.dsFactor;
  this.resolution     = this.samplerate / this.fftSize;
  this.bufferSize     = this.fftSize * this.dsFactor;
  this.windowSize     = 512;
  this.tWindow        = this.bufferSize / this.strSampleRate;
  this.frequencies    = frequencies.map(this.fromFreqArray);

  this.fft = new FFT(this.fftSize,this.samplerate);
  this.retCallback  = callback;
  this.samples      = new Ring(this.bufferSize, this.windowSize);
};

Tuner.prototype.fromFreqArray = function (e,i,obj) {
  var note = new Object();

  note.frequency = e[0];
  note.name      = e[1];

  return note;
};

Tuner.prototype.closestNote = function (freq) {
  /* Do a binary search on the frequency array and
   * return closest match;
   */
  /* TODO : throw exception if the frequencies array is empty */
  var noteList    = this.frequencies;
  var length      = noteList.length;
  var closestNote = noteList[0];

  var min = 0;
  var max = length - 1;
  var mid = 0;
  var midFreq = 0;

  while (min <= max) {

    mid = (max + min) >> 1;
    midFreq     = noteList[mid].frequency;

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

  if (succ >= 0 && succ < length) {
    succFreq = noteList[succ].frequency;
    succDiff = Math.abs(freq - succFreq);
  }

  if (pred >= 0 && pred < length) {
    predFreq = noteList[pred].frequency;
    predDiff = Math.abs(freq - predFreq);
  }

  if (succFreq && (midDiff > succDiff)){
    closestNote = noteList[mid+1];
  } else if (predFreq && (midDiff > predDiff)) {
    closestNote = noteList[mid-1];
  } else {
    closestNote = noteList[mid];
  }

  var cents = 1200 * (Math.log(freq / closestNote.frequency) / Math.log(2));

  return { 
    "note"      : closestNote,
    "cents"     : cents,
    "frequency" : freq
  };
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

  this.samples.map(windowHann);

  var downsampled = [];

  for (var i=0; i < this.samples.length ; i += step) {
    downsampled.push(this.samples.get(i));
  }

  this.fft.forward(downsampled);

  var spectrum = this.fft.spectrum;
  var peek     = this.hps(spectrum);

  this.retCallback({
      peek : this.closestNote(peek*this.resolution),
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
