(function (global) {

var viewElement   = document.createElement("div")
  , fgCVS         = document.createElement("canvas")
  , bgCVS         = document.createElement("canvas")
  , fgCTX         = fgCVS.getContext("2d")
  , bgCTX         = bgCVS.getContext("2d")
  , peek          = defaultPeek
  , requestType   = { peek : true, spectrum : false, updateTime : true}
  , audDiff       = 5 /* cents */
  , mxCents       = 50
  , padding       = 40
  , twoPI         = 2 * Math.PI
  , width         = 800
  , height        = 260
  , centerX       = width / 2
  , centerY       = height
  , radius        = calcRadius(width, height)
  , circumference = twoPI * radius
  , quadrantArc   = circumference / 4
  , tickWidth     = 2
  , maxTickWidth  = quadrantArc / mxCents
  , unitStep      = quadrantArc / mxCents
  , tickLength    = 16
  , markStep      = 10
  , dCents        = 0
  , totalSteps    = 30
  , animStep      = 1
  , dt            = 1 /* seconds */
  , mxSteps       = dt * totalSteps
  , baseColor     = "rgb(58,58,58)"   /* almost black */
  , bgColor       = "white"
  , tunedColor    = "rgb(122,153,66)" /* green */
  , notTunedColor = "rgb(140,46,46)"  /* red */
  , noteFontSize  = radius / 4
  , freqFontSize  = radius / 8
  , noteFontName  = "sans-serif"
  , freqFontName  = "sans-serif"
  , noteFont      = fontStringPX(noteFontSize,noteFontName)
  , freqFont      = fontStringPX(freqFontSize,freqFontName)
  ;

function updateGaugeParameters(w, h) {
  radius        = calcRadius(w,h);
  circumference = twoPI * radius;
  quadrantArc   = circumference / 4;
  maxTickWidth  = quadrantArc / mxCents;
  unitStep      = quadrantArc / mxCents;

  noteFontSize  = radius / 4;
  freqFontSize  = radius / 8;
  noteFont = fontStringPX(noteFontSize,noteFontName);
  freqFont = fontStringPX(freqFontSize,freqFontName);
}

function calcRadius(w,h) {
  var tw = w / 2 - padding
    , th = h - padding
    ;

  return tw < th ? tw : th;
}

/* FOREGROUND Canvas setup & properties */
fgCVS.id = "gtunerViewFg";

fgCVS.width  = width;
fgCVS.height = height;

fgCVS.style.position = "absolute";
fgCVS.style.zIndex   = 1;

function fgSetStyle() {
  fgCTX.textAlign   = "center";
  fgCTX.fillStyle   = baseColor;
  fgCTX.strokeStyle = baseColor;
  fgCTX.font        = noteFont;
}
/* FOREGROUND */

/* BACKGROUND Canvas setup & properties */
bgCVS.id = "gtunerViewBg";

bgCVS.width  = width;
bgCVS.height = height;

bgCVS.style.position = "absolute";
bgCVS.style.zIndex   = 0;
bgCVS.style.background = bgColor;

function bgSetStyle() {
  bgCTX.fillStyle    = baseColor;
  bgCTX.strokeStyle  = baseColor;
  bgCTX.lineWidth    = tickWidth;
  bgCTX.textAlign    = "center";
  bgCTX.font         = "14px sans-serif";
  bgCTX.textBaseline = "bottom";
}
/* BACKGROUND */

/* Wrap background and foreground elements for easier manipulation */
viewElement.id = "gtunerView";

viewElement.appendChild(bgCVS);
viewElement.appendChild(fgCVS);

function drawTicks(from, to, color, arc) {

  /* The thick at zero is painted two times, this will affect the color. */

  var halfMark = markStep / 2
    , currentTickLength = tickLength
    , alfa
    , y0
    , y1
    , xc0
    , xc1
    , yc0
    , yc1
    , textX0
    , textX1
    , textY
    , textYC
    , textXC
    , maxRad
    , charOffset
    , unitTickLength = tickLength / 3
    , halfTickLength = tickLength / 1.5
    , sTickLength    = currentTickLength / 2
    ;

  bgCTX.beginPath();
  bgCTX.strokeStyle = color;

  while (from >= to) {

    if (from % markStep == 0) {
      currentTickLength = tickLength;
    } else if (from % halfMark == 0) {
      currentTickLength = halfTickLength;
    } else {
      currentTickLength = unitTickLength;
    }

    alfa = arc / radius;
    sTickLength = currentTickLength / 2;
    maxRad = radius + sTickLength

    xc0 = (radius + sTickLength) * Math.cos(alfa);
    xc1 = (radius - sTickLength) * Math.cos(alfa);
    yc0 = (radius + sTickLength) * Math.sin(alfa);
    yc1 = (radius - sTickLength) * Math.sin(alfa);

    charOffset = bgCTX.measureText(from - mxCents).width / 2;

    textXC = (maxRad + charOffset) * Math.cos(alfa);
    textYC = (maxRad + charOffset) * Math.sin(alfa)

    textX0 = centerX + textXC;
    textX1 = centerX - textXC;

    textY  = centerY - textYC;

    if (from % markStep == 0) {
      if (from != 50) {
        bgCTX.fillText("+" + (-1 * (from - mxCents)), textX0, textY);
      }
      bgCTX.fillText(from - mxCents, textX1, textY);
    }

    y0 = centerY - yc0;
    y1 = centerY - yc1;

    bgCTX.moveTo(centerX - xc0, y0);
    bgCTX.lineTo(centerX - xc1, y1);

    /* Hack to draw 0 only once. */
    /* TODO fix this hack */
    if (from != 50) {
      bgCTX.moveTo(centerX + xc0, y0);
      bgCTX.lineTo(centerX + xc1, y1);
    }

    arc  -= unitStep;
    from -= 1;
  }

  bgCTX.stroke();
  return arc;
}

function drawBackground() {

  var arc = quadrantArc;

  bgCTX.clearRect(0,0,bgCVS.width,bgCVS.height);

  bgCTX.beginPath();
  bgCTX.arc(centerX,centerY,10,0,twoPI,false);
  bgCTX.fill();

  arc = drawTicks(mxCents, mxCents - audDiff, tunedColor, arc);
  drawTicks(mxCents - audDiff - 1,0, notTunedColor, arc);

}

function CentsGauge(containerID) {

  if (CentsGauge.prototype.instance) {
    console.log("An instance of CentsGauge already exists.");
    return CentsGauge.prototype.instance;
  }

  CentsGauge.prototype.instance = this;

  Object.defineProperties(this, {
    "width" : {
        enumerable   : true
      , configurable : false
      , get : function () {
          return width;
      }
      , set : function (val) {
          width = val;

          fgCVS.width = width;
          bgCVS.width = width;

          centerX  = width / 2;

          updateGaugeParameters(width, height);

          bgSetStyle();
          fgSetStyle();

          drawBackground();
      }
    }
    , "height" : {
        enumerable   : true
      , configurable : false
      , get : function () {
          return height;
      }
      , set : function (val) {
          height = val;

          fgCVS.height = height;
          bgCVS.height = height;
          centerY      = height;

          updateGaugeParameters(width, height);

          bgSetStyle();
          fgSetStyle();

          drawBackground();
      }
    }
    , "padding" : {
        enumerable   : true
      , configurable : false
      , get : function () {
          return width;
      }
      , set : function (val) {
          padding = val;

          updateGaugeParameters(width, height);

          bgSetStyle();
          fgSetStyle();

          drawBackground();
      }
    }
    , "tickWidth" : {
        configurable : false
      , enumerable   : true
      , get : function () {
          return tickWidth;
      }
      , set : function (val) {

          if (val <= maxTickWidth) {
            tickWidth = val;
            bgCTX.lineWidth = tickWidth;
          }

          drawBackground();
      }
    }
    , "tickLength" : {
        configurable : false
      , enumerable   : true
      , get : function () {
          return tickLength;
      }
      , set : function (val) {
          tickLength = val;

          drawBackground();
      }
    }
    , "markStep" : {
        configurable : false
      , enumerable   : true
      , get : function () {
          return markStep;
      }
      , set : function (val) {
          markStep = val;

          drawBackground();
      }
    }
    , "radius" : {
        enumerable   : true
      , configurable : false
      , get : function () {
          return radius;
      }
      , set : function (r) {
          radius = r;

          circumference = twoPI * radius;
          quadrantArc   = circumference / 4;
          maxTickWidth  = quadrantArc / mxCents;
          unitStep      = quadrantArc / mxCents;

          noteFontSize  = radius / 4;
          freqFontSize  = radius / 8;
          noteFont = fontStringPX(noteFontSize,noteFontName);
          freqFont = fontStringPX(freqFontSize,freqFontName);

          drawBackground();
      }
    }
    , "peek" : {
        value        : peek
      , configurable : false
      , enumerable   : false
      , writable     : false
    }
    , "requestType" : {
        value        : requestType
      , configurable : false
      , enumerable   : true
      , writable     : false
    }
    , "baseColor" : {
        configurable : false
      , enumerable   : true
      , get : function () {
          return baseColor;
      }
      , set : function (value) {
          baseColor = value;

          fgCTX.fillStyle   = baseColor;
          fgCTX.strokeStyle = baseColor;

          bgCTX.fillStyle   = baseColor;
          bgCTX.strokeStyle = baseColor;

          drawBackground();
      }
    }
    , "bgColor" : {
        configurable : false
      , enumerable : true
      , get : function () {
          return bgColor;
      }
      , set : function (value) {
          bgColor = value;

          bgCVS.style.background = bgColor;
      }
    }
    , "tunedColor" : {
        configurable : false
      , enumerable   : true
      , get : function () {
          return tunedColor;
      }
      , set : function (value) {
          tunedColor = value;

          drawBackground();
      }
    }
    , "notTunedColor" : {
        configurable : false
      , enumerable   : true
      , get : function () {
          return notTunedColor;
      }
      , set : function (value) {
          notTunedColor = value;

          drawBackground();
      }
    }
    , "noteFont" : {
        configurable : false
      , enumerable   : false
      , get : function () {
          return noteFont;
        }
    }
    , "freqFont" : {
        configurable : false
      , enumerable   : false
      , get : function () {
          return freqFont;
      }
    }
    , "noteFontSize" : {
        configurable : false
      , enumerable   : true
      , set : function (val) {
          noteFontSize = val;
          noteFont     = fontStringPX(noteFontSize,noteFontName);
          fgCTX.font   = noteFont;
        }
      , get : function () {
          return noteFontSize;
      }
    }
    , "freqFontSize" : {
        configurable : false
      , enumerable   : true
      , set : function (val) {
          freqFontSize = val;
          freqFont     = fontStringPX(freqFontSize,freqFontName);
      }
      , get : function () {
          return freqFontSize;
      }
    }
    , "noteFontName" : {
        configurable : false
      , enumerable   : true
      , set : function (val) {
          noteFontName = val;
          noteFont     = fontStringPX(noteFontSize,noteFontName);
          fgCTX.font   = noteFont;
      }
      , get : function () {
          return noteFontName;
        }
    }
    , "freqFontName" : {
        configurable : false
      , enumerable   : true
      , set : function (val) {
          freqFontName = val;
          freqFont = fontStringPX(freqFontSize,freqFontName);
      }
      , get : function () {
          return freqFontName;
      }
    }
    , "run" : {
        value : function() {

          var arc  = quadrantArc - (dCents * quadrantArc / mxCents)
            , alfa = arc / radius
            , x = centerX + radius * Math.cos(alfa)
            , y = centerY - radius * Math.sin(alfa)
            , noteTextWidth
            , frequencyTextWidth
            ;

          fgCTX.clearRect(0,0,width,height);

          fgCTX.fillText(peek.note.name,centerX, centerY - radius / 1.5);

          fgCTX.save();

          fgCTX.font = freqFont;
          fgCTX.fillText(peek.frequency.toFixed(2) + " Hz",centerX, centerY - radius / 2.5);

          fgCTX.restore();

          fgCTX.beginPath();
          fgCTX.moveTo(centerX,centerY);
          fgCTX.lineTo(x,y);
          fgCTX.stroke();

          if (dCents > peek.cents) {
            dCents -= animStep;

            if (dCents < peek.cents) {
              dCents = peek.cents;
            }
          } else {
            dCents += animStep;

            if (dCents > peek.cents) {
              dCents = peek.cents;
            }
          }
          window.requestAnimationFrame(this.run.bind(this));
      }
      , enumerable   : false
      , configurable : false
      , writable     : false
    }
    , "update" : {
        value : function (element) {

          if (element.peek) {

            peek = element.peek;

            var tmpAnimStep = Math.abs(dCents - Math.abs(peek.cents)) / mxSteps;

            animStep = tmpAnimStep > 1 ? tmpAnimStep : 1 ;
          }

          if (element.updateTime) {
            dt = element.updateTime;
            mxSteps = dt * totalSteps;
          }
      }
      , enumerable   : false
      , configurable : false
      , writable     : false
    }
  });

    document.getElementById(containerID).appendChild(viewElement);

    bgSetStyle();
    fgSetStyle();
    drawBackground();

};

  global.CentsGauge = CentsGauge;

}(window));
