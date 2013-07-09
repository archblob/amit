/*
 * Color Scheme :
 * green = rgb(122,153,66);
 * black = rgb(58,58,58);
 * white = rgb(227,227,227);
 * red   = rgb(140,46,46);
 * blue  = rgb(44,114,158);
 */

(function (global) {

  window.requestAnimationFrame =
    window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  
  /* default color scheme */
  var green = "rgb(122,153,66)";
  var black = "rgb(58,58,58)";
  var white = "rgb(227,227,227)";
  var red   = "rgb(140,46,46)";
  var blue  = "rgb(44,114,158)";

  var defaultPeek = {
      note : {
        name : "I",
        frequency : 0.00
      },
      cents : 0,
      frequency : 0.00
  };


  function ViewContextAndStyle (containerID) {

    var _cvs = document.createElement("canvas");
    _cvs.id = "gtunerView";

    document.getElementById(containerID).appendChild(_cvs);

    var _ctx = _cvs.getContext("2d");

    var _peek  = defaultPeek;
    var _color = black;

    _ctx.fillStyle   = _color;
    _ctx.strokeStyle = _color;

    var _tunedColor    = green;
    var _notTunedColor = red;

    var _noteFontSize = 50;
    var _freqFontSize = 20;
    var _noteFontName = "sans-serif";
    var _freqFontName = "sans-serif";
      
    var _noteFont = _noteFontSize + "px " + _noteFontName;
    var _freqFont = _freqFontSize + "px " + _freqFontName;

    Object.defineProperties(this, {
      "cvs" : {
        value        : _cvs,
        configurable : false,
        enumerable   : false,
        writable     : false
      },
      "ctx" : {
        value        : _ctx,
        configurable : false,
        enumerable   : false,
        writable     : false
      },
      "peek" : {
        value        : _peek,
        configurable : false,
        enumerable   : true,
        writable     : true
      },
      "color" : {
        configurable : false,
        enumerable   : true,
        get : function () {
          return _color;
        },
        set : function (value) {
          _color = value;

          _ctx.fillStyle   = _color;
          _ctx.strokeStyle = _color;
        }
      },
      "tunedColor" : {
        configurable : false,
        enumerable   : true,
        get : function () {
          return _tunedColor;
        },
        set : function (value) {
          _tunedColor = value;
        }
      },
      "notTunedColor" : {
        configurable : false,
        enumerable   : true,
        get : function () {
          return _notTunedColor;
        },
        set : function (value) {
          _nottunedColor = value;
        }
      },
      "noteFont" : {/* TODO : throw exception when someone tries to set */
        configurable : false,
        enumerable   : false,
        get          : function () {
          return _noteFont;
        }
      },
      "freqFont" : {
        configurable : false,
        enumerable   : false,
        get          : function () {
          return _freqFont;
        }
      },
      "noteFontSize" : {
        configurable : false,
        enumerable   : true,
        set          : function (val) {
          _noteFontSize = val;
          _noteFont = _noteFontSize + "px " + _noteFontName;
        },
        get          : function () {
          return _noteFontSize;
        }
      },
      "freqFontSize" : {
        configurable : false,
        enumerable   : true,
        set          : function (val) {
          _freqFontSize = val;
          _freqFont = _freqFontSize + "px " + _freqFontName;
        },
        get          : function () {
          return _freqFontSize;
        }
      },
      "noteFontName" : {
        configurable : false,
        enumerable   : true,
        set          : function (val) {
          _noteFontName = val;
          _noteFont = _noteFontSize + "px " + _noteFontName;
        },
        get          : function () {
          return _noteFontName;
        }
      },
      "freqFontName" : {
        configurable : false,
        enumerable   : true,
        set          : function (val) {
          _freqFontName = val;
          _freqFont = _freqFontSize + "px " + _freqFontName;
        },
        get          : function () {
          return _freqFontName;
        }
      }
    });
  }

  function CentsView() {

    ViewContextAndStyle.apply(this,arguments);

    this.cvs.width  = 400;
    this.cvs.height = 200;

    this.centerX       = this.cvs.width / 2;
    this.centerY       = this.cvs.height;
    this.circumference = 1000;
    this.radius        = this.circumference / (2*Math.PI);
    this.quadrantArc   = this.circumference / 4;

    this.needleColor   = "rgb(58,58,58)";
    this.dotColor      = "rgb(58,58,58)";
    this.dotRadius     = 3;
    this.zeroDotColor  = "rgb(44,114,158)";
    this.zeroDotRadius = 5;
    this.markStep      = 50;
  };

  CentsView.prototype.background = function() {

    this.ctx.beginPath();
    this.ctx.arc(this.centerX,this.centerY,10,0,Math.PI,true);
    this.ctx.fillStyle = this.needleColor;
    this.ctx.fill();

    for(var arc=0; arc <= this.circumference / 2; arc+= this.markStep){
      var markRadius = this.dotRadius;
      var fillStyle  = this.dotColor;

      this.ctx.beginPath();
      var alfa = arc / this.radius;

      if (arc == this.quadrantArc){
        markRadius = this.zeroDotRadius;
        fillStyle  = this.zeroDotColor;
      }

      var x = this.centerX - this.radius * Math.cos(alfa);
      var y = this.centerY - this.radius * Math.sin(alfa);

      this.ctx.arc(x,y,markRadius,0,2*Math.PI,true);
      this.ctx.fillStyle = fillStyle;
      this.ctx.fill();
    }
  };

  CentsView.prototype.run = function() {

    var arc  = this.quadrantArc - this.peek.cents;
    var alfa = arc / this.radius;

    var x = this.centerX + this.radius * Math.cos(alfa);
    var y = this.centerY - this.radius * Math.sin(alfa);

    this.ctx.clearRect(0,0,this.cvs.width,this.cvs.height);

    this.background();

    this.ctx.font      = this.noteFont;
    this.ctx.fillStyle = this.color;
    this.ctx.fillText(this.peek.note.name,20,50);

    this.ctx.font = this.freqFont;
    this.ctx.fillText(this.peek.frequency.toFixed(2) + " Hz",this.cvs.width-110,40);

    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX,this.centerY);
    this.ctx.lineTo(x,y);
    this.ctx.strokeStyle = this.needleColor;
    this.ctx.stroke();

    window.requestAnimationFrame(this.run.bind(this));
  };

  CentsView.prototype.update = function (element) {

    this.peek = element.peek;

  };

  function SimpleView() {

    ViewContextAndStyle.apply(this, arguments);

    var _width  = 200;
    var _height = 100;
    
    this.cvs.width  = _width;
    this.cvs.height = _height;
    
    this.noteFontSize = (3/4) * _height; 
    this.freqFontSize = (1/4) * _height;

    var xpad = 10;
    var ypad = 10;
    var semiMajorAxis = _width / 6;
    var semiMinorAxis = _height / 3;
    var cx = _width / 2;
    var cy = _height / 2;
    var x  = _width - (semiMajorAxis + xpad);

    Object.defineProperties(this, {
      "width" : {
        enumerable   : true,
        configurable : false,
        get          : function () {
          return _width;
        },
        set          : function (val) {
          _width = val;

          this.cvs.width = _width;
          semiMajorAxis  = _width / 3;

          cx = _width / 2;
          x  = _width - (semiMajorAxis + xpad);
        }
      },
      "height" : {
        enumerable   : true,
        configurable : false,
        get          : function () {
          return _height;
        },
        set          : function (val) {
          _height = val;

          cy              = _height / 2;
          this.cvs.height = _height;
          semiMinorAxis   = _height / 3;

          this.noteFontSize = (3/4) * _height; 
          this.freqFontSize = (1/4) * _height;
        }
      }
    });
    
    Object.defineProperties(SimpleView.prototype, {
      "drawArrow" : {
        value        : function (direction) {

          var y = cy + (this.freqFontSize / 2 * direction); 
          var dir    = semiMinorAxis * direction;
          var rpoint = y + (dir / 2);

          this.ctx.beginPath();

          this.ctx.moveTo(x - semiMajorAxis,y);
          this.ctx.lineTo(x,y + dir);
          this.ctx.lineTo(x + semiMajorAxis, y);
          this.ctx.bezierCurveTo(x, rpoint, x, rpoint, x - semiMajorAxis, y);

          this.ctx.fill();
        },
        enumerable   : false,
        configurable : false,
        writable     : false,
      },
     "drawNoteName" : {
       value        : function () {

         this.ctx.textAlign    = 'left';
         this.ctx.textBaseline = 'bottom';
         this.ctx.font         = this.noteFont;

         this.ctx.fillText(this.peek.note.name, xpad, ypad);
       },
       enumerable   : false,
       configurable : false,
       writable     : false
     },
     "drawFrequency" : {
       value        : function () {

         var cents = Math.abs(this.peek.cents);

         this.ctx.fillStyle = cents - 5 <= 5 ? this.tunedColor : this.notTunedColor; 

         this.ctx.textAlign    = 'center';
         this.ctx.textBaseline = 'middle';
         this.ctx.font         = this.freqFont;

         this.ctx.fillText(this.peek.frequency.toFixed(2), x, cy);

         this.ctx.fillStyle = black;
       },
       enumerable   : false,
       configurable : false,
       writable     : false
     },
     "run" : {
       value        : function () {

         var cents   = this.peek.cents;
         var tuneDir = cents > 0 ? 1 : -1;

         this.ctx.clearRect(0, 0, _width, _height);

         this.drawArrow(tuneDir);
         this.drawFrequency();
         this.drawNoteName();

         window.requestAnimationFrame(this.run.bind(this));
       },
       enumerable   : false,
       configurable : false,
       writable     : false
     },
     "update" : {
       value        : function (element) {
         this.peek = element.peek;
       },
       enumerable   : true,
       configurable : false,
       writable     : false
     }
    });
  }

  global['CentsView']  = CentsView;
  global['SimpleView'] = SimpleView;

}(window));
