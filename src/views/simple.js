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
