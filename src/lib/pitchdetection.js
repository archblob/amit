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