/*
 * Copyright (c) 2013 Csernik Flaviu Andrei
 *
 * See the file LICENSE.txt for copying permission.
 *
 */

"use strict";

window.requestAnimationFrame =
  window.requestAnimationFrame || window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var defaultPeek = {
  note : {
    name : "I",
    frequency : 0.00
  },
  cents : 0,
  frequency : 0.00
};

function fontStringPX(size, name) {
  return size + "px " + name;
}

function TunerView(containerID) {
  var canvases = []
    , reqCvs   = 0
    , viewType
    , viewContainer = document.getElementById(containerID)
    , viewWrapper   = document.createElement("div")
    ;

  viewWrapper.id = "tunerWrapper"
  /* TODO: check to see if the container is found. */

  Object.defineProperties(this, {
    "viewType" : {
        enumerable   : true
      , configurable : false
      , get : function () {
          return viewType;
        }
      , set : function (vT) {
          /* TODO: checks if it is a function and
           * and methods has the necessary methods.
           */
          if (viewType) {
            window.clearInterval(viewType.startID);
          }
          viewType = vT;
          /* TODO: check to see it it's a natural number */
          reqCvs   = viewType.requiredCVS;
          var depth = canvases.length;

          while (depth != reqCvs) {
            if (depth < reqCvs) {
              canvases[depth] = document.createElement("canvas");
              depth += 1;
            } else {
              viewWrapper.removeChild(canvases[depth - 1]);
              canvases.pop();
              depth -= 1;
            }
          }

          for (var cvs in canvases) {
            viewWrapper.appendChild(canvases[cvs]);
          }

          viewContainer.appendChild(viewWrapper);

          viewType.setCVS = canvases;
          viewType.start();
        }
    }
  })

}
function SimpleView() {

  if (SimpleView.prototype.instance) {
    console.log("An instance of SimpleView already exists.");
    return SimpleView.prototype.instance;
  }

  SimpleView.prototype.instance = this;

  var cvs
  , ctx
  , peek             = defaultPeek
  , requestType      = { peek : true, spectrum : false, updateTime : false}
  , requiredCVS      = 1
  , width            = 400
  , height           = 200
  , xpad             = 10
  , ypad             = 10
  , semiMajorAxis    = width / 6
  , semiMinorAxis    = height / 3
  , cx               = width / 2
  , cy               = height / 2
  , x                = width - (semiMajorAxis + 2 * xpad)
  , verticalSepX     = cx + xpad
  , verticalSepBY    = height - ypad
  , noteFontMaxWidth = cx - xpad
  , noteFontSize     = height - 2 * ypad
  , freqFontSize     = 0.2 * height
  , baseColor        = "rgb(58,58,58)"   /* almost black */
  , bgColor          = "white"
  , tunedColor       = "rgb(122,153,66)" /* green */
  , notTunedColor    = "rgb(140,46,46)"  /* red */
  , noteFontName     = "sans-serif"
  , freqFontName     = "sans-serif"
  , noteFont         = fontStringPX(noteFontSize,noteFontName)
  , freqFont         = fontStringPX(freqFontSize,freqFontName)
  , startID
  ;

  function ctxStyleSetup() {

    ctx.fillStyle   = baseColor;
    ctx.strokeStyle = baseColor;

  }

  function drawArrow(direction) {

    var y = cy + (freqFontSize / 2 * direction)
    , dir    = semiMinorAxis * direction
    , rpoint = y + (dir / 2)
    ;

    ctx.beginPath();

    ctx.moveTo(x - semiMajorAxis,y);
    ctx.lineTo(x,y + dir);
    ctx.lineTo(x + semiMajorAxis, y);
    ctx.bezierCurveTo(x, rpoint, x, rpoint, x - semiMajorAxis, y);

    ctx.fill();
  }

  function drawNoteName() {

    ctx.save();

    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.font         = noteFont;

    ctx.fillText(peek.note.name, xpad, cy, noteFontMaxWidth);

    ctx.restore();
  }

  function drawFrequency() {

    var cents = Math.abs(peek.cents);

    ctx.save();

    ctx.fillStyle = cents - 5 <= 5 ? tunedColor : notTunedColor;

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.font         = freqFont;

    ctx.fillText(peek.frequency.toFixed(2), x, cy);

    ctx.restore();
  }

  function drawSeparator(x0, y0, x1, y1) {

    ctx.save();

    ctx.beginPath();

    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);

    ctx.lineCap     = "round";

    ctx.stroke();

    ctx.restore();
  }

  Object.defineProperties(this, {
      "setCVS" : {
        enumerable   : false
      , configurable : false
      , set : function (cvs) {

          cvs = cvs[0];
          ctx = cvs.getContext("2d");

          cvs.id = "gtunerView";

          cvs.width  = width;
          cvs.height = height;
          cvs.style.background = bgColor;

          ctxStyleSetup();
      }
    }
    , "width" : {
        enumerable   : true
      , configurable : false
      , get : function () {
          return width;
      }
      , set : function (val) {
          width = val;

          cvs.width = width;
          semiMajorAxis  = width / 6;

          cx = width / 2;
          x  = width - (semiMajorAxis + xpad);

          noteFontMaxWidth = cx - xpad;
          verticalSepX     = cx + xpad;
          ctxStyleSetup();
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

          cy         = height / 2;
          cvs.height = height;

          semiMinorAxis = height / 3;
          verticalSepBY = height - ypad;

          noteFontSize = 0.6 * height;
          freqFontSize = 0.2 * height;

          ctxStyleSetup();
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
    , "requiredCVS" : {
        value        : requiredCVS
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

          ctxStyleSetup();
      }
    }
    , "bgColor" : {
        configurable : false
      , enumerable   : true
      , get : function () {
          return bgColor;
      }
      , set : function (value) {
        bgColor = value;

        cvs.style.background = bgColor;
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
    , "start" : {
        value : function () {

          var cents   = peek.cents
            , tuneDir = cents > 0 ? 1 : -1
            ;

          ctx.clearRect(0, 0, width, height);

          drawSeparator(verticalSepX, ypad, verticalSepX, verticalSepBY);
          drawArrow(tuneDir);
          drawFrequency();
          drawNoteName();

          startID = window.requestAnimationFrame(this.start.bind(this));
       }
      , enumerable   : false
      , configurable : false
      , writable     : false
    }
    , "update" : {
        value : function (element) {

          if(!startID){
            throw new ReferenceError("Start the view before calling update.");
          }
          if (element.peek) {
            peek = element.peek;
          }
       }
      , enumerable   : false
      , configurable : false
      , writable     : false
    }
  });
}
function CentsGauge() {

  if (CentsGauge.prototype.instance) {
    console.log("An instance of CentsGauge already exists.");
    return CentsGauge.prototype.instance;
  }

  CentsGauge.prototype.instance = this;

  var fgCVS
  , bgCVS
  , fgCTX
  , bgCTX
  , peek          = defaultPeek
  , requestType   = { peek : true, spectrum : false, updateTime : true}
  , requiredCVS   = 2
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
  , startID
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

  function fgSetStyle() {
    fgCTX.textAlign   = "center";
    fgCTX.fillStyle   = baseColor;
    fgCTX.strokeStyle = baseColor;
    fgCTX.font        = noteFont;
  }

  function bgSetStyle() {
    bgCTX.fillStyle    = baseColor;
    bgCTX.strokeStyle  = baseColor;
    bgCTX.lineWidth    = tickWidth;
    bgCTX.textAlign    = "center";
    bgCTX.font         = 0.05 * Math.min(width,height) + "px sans-serif";
    bgCTX.textBaseline = "bottom";
  }

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
      maxRad = radius + sTickLength;

      xc0 = (radius + sTickLength) * Math.cos(alfa);
      xc1 = (radius - sTickLength) * Math.cos(alfa);
      yc0 = (radius + sTickLength) * Math.sin(alfa);
      yc1 = (radius - sTickLength) * Math.sin(alfa);

      charOffset = bgCTX.measureText(from - mxCents).width / 2;

      textXC = (maxRad + charOffset) * Math.cos(alfa);
      textYC = (maxRad + charOffset) * Math.sin(alfa);

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

  Object.defineProperties(this, {
      "setCVS" : {
        enumerable   : true
      , configurable : false
      , set : function (cvs) {

          fgCVS         = cvs[0];
          bgCVS         = cvs[1];
          fgCTX         = fgCVS.getContext("2d");
          bgCTX         = bgCVS.getContext("2d");

          /* FOREGROUND Canvas setup & properties */
          fgCVS.id = "gtunerViewFg";

          fgCVS.width  = width;
          fgCVS.height = height;

          fgCVS.style.position = "absolute";
          fgCVS.style.zIndex   = 1;
          fgCVS.style.background = "transparent";

          /* BACKGROUND Canvas setup & properties */
          bgCVS.id = "gtunerViewBg";

          bgCVS.width  = width;
          bgCVS.height = height;

          bgCVS.style.position = "absolute";
          bgCVS.style.zIndex   = 0;
          bgCVS.style.background = bgColor;

          bgSetStyle();
          fgSetStyle();
          drawBackground();
      }
    }
    , "width" : {
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
    , "requiredCVS" : {
        value        : requiredCVS
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
    , "start" : {
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

          startID = window.requestAnimationFrame(this.start.bind(this));
      }
      , enumerable   : false
      , configurable : false
      , writable     : false
    }
    , "update" : {
        value : function (element) {

          if(!startID){
            throw new ReferenceError("Start the view before calling update.");
          }

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

};

