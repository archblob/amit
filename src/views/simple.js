var SimpleView = (function (containerID) {

  function SimpleView() {

    ViewContextAndStyle.apply(this, arguments);

    var _width  = 400;
    var _height = 200;

    this.cvs.width  = _width;
    this.cvs.height = _height;

    var xpad = 10;
    var ypad = 10;

    this.noteFontSize = _height - 2 * ypad; 
    this.freqFontSize = 0.2 * _height;

    var semiMajorAxis = _width / 6;
    var semiMinorAxis = _height / 3;

    var cx = _width / 2;
    var cy = _height / 2;
    var x  = _width - (semiMajorAxis + 2 * xpad);

    var verticalSepX  = cx + xpad;
    var verticalSepBY = _height - ypad;
    var horizontalSepY = this.noteFontSize + 2 * ypad;

    var noteFontMaxWidth = cx - xpad;

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
          semiMajorAxis  = _width / 6;

          cx = _width / 2;
          x  = _width - (semiMajorAxis + xpad);
          noteFontMaxWidth = cx - xpad;
          verticalSepX     = cx + xpad;
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
          verticalSepBY   = _height - ypad;
          horizontalSepY  = this.noteFontSize + 2 * ypad;

          this.noteFontSize = 0.6 * _height; 
          this.freqFontSize = 0.2 * _height;
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

         this.ctx.save();

         this.ctx.textAlign    = 'left';
         this.ctx.textBaseline = 'middle';
         this.ctx.font         = this.noteFont;

         this.ctx.fillText(this.peek.note.name, xpad, cy, noteFontMaxWidth);

         this.ctx.restore();
       },
       enumerable   : false,
       configurable : false,
       writable     : false
     },
     "drawFrequency" : {
       value        : function () {

         var cents = Math.abs(this.peek.cents);

         this.ctx.save();

         this.ctx.fillStyle = cents - 5 <= 5 ? this.tunedColor : this.notTunedColor; 

         this.ctx.textAlign    = 'center';
         this.ctx.textBaseline = 'middle';
         this.ctx.font         = this.freqFont;

         this.ctx.fillText(this.peek.frequency.toFixed(2), x, cy);

         this.ctx.restore();
       },
       enumerable   : false,
       configurable : false,
       writable     : false
     },
     "drawSeparator" : {
       value        : function (x0, y0, x1, y1) {

         this.ctx.save();

         this.ctx.beginPath();

         this.ctx.moveTo(x0, y0);
         this.ctx.lineTo(x1, y1);

         this.ctx.strokeStyle = lightBlack;
         this.ctx.lineCap = "round";

         this.ctx.stroke();

         this.ctx.restore();
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

         this.drawSeparator(verticalSepX, ypad, verticalSepX, verticalSepBY);
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

  if (!this.instance) {
    this.instance = new SimpleView(containerID);
  } else {
    console.log("An instance of SimpleView already exists.");
  }

  return this.instance;

});