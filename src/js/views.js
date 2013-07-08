/*
 * Color Scheme :
 * green = rgb(122,153,66);
 * black = rgb(58,58,58);
 * white = rgb(227,227,227);
 * red   = rgb(140,46,46);
 * blue  = rgb(44,114,158);
 */

(function (global) {

  window.requestAnimationFrame = window.webkitRequestAnimationFrame;

  function ViewContextAndStyle (containerID) {
    this.cvs    = document.createElement('canvas');
    this.cvs.id = 'gtunerView';

    document.getElementById(containerID).appendChild(this.cvs);

    this.ctx  = this.cvs.getContext('2d');

    this.peek = { note : { name : "Init",
      frequency : 0.00},
      cents : 0,
      frequency : 0.00
    };

    this.color         = "rgb(58,58,58)";
    this.noteFont      = "50px sans-serif";
    this.freqFont      = "20px sans-serif";
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

    this.cvs.width  = 200;
    this.cvs.height = 100;
    
    this.xpad = 10;
    this.ypad = 10;
    this.maj  = 30;
    this.min  = 30;
    this.cx = this.cvs.width / 2;
    this.cy = this.cvs.height / 2;
  }

  SimpleView.prototype.drawArrow = function (x, y, semiMajor, semiMinor, direction) {

    var dir = semiMinor * direction;

    this.ctx.beginPath();

    this.ctx.moveTo(x - semiMajor,y);
    this.ctx.lineTo(x,y + dir);
    this.ctx.lineTo(x + semiMajor, y);
    this.ctx.bezierCurveTo(x, y + (dir / 2), x, y + (dir / 2), x - semiMajor, y);

    this.ctx.fill();

  };

  SimpleView.prototype.drawNoteName = function (name) {

    this.ctx.textAlign    = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.font         = "60pt Arial";

    this.ctx.fillText(name,this.xpad,this.cy);

  };

  SimpleView.prototype.drawFrequency = function (x, y,freq) {

    this.ctx.textAlign    = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font         = "10pt Arial";

    this.ctx.fillText(freq.toString(),x,y);

  };

  SimpleView.prototype.run = function () {

    var noteName  = this.peek.note.name;
    var frequency = this.peek.frequency.toFixed(2) + ' Hz';
    var cents     = this.peek.cents;
    var arrowx    = this.cvs.width - this.maj - this.xpad;

    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);

    var tuneDir = cents > 0 ? 1 : -1;

    this.drawArrow(arrowx,this.cy + (10 * tuneDir),this.maj,this.min,tuneDir);

    this.drawFrequency(arrowx, this.cy,frequency);
    this.drawNoteName(noteName);
    window.requestAnimationFrame(this.run.bind(this));

  };

  SimpleView.prototype.update = function (element) {

    this.peek = element.peek;

  };

  global['CentsView']  = CentsView;
  global['SimpleView'] = SimpleView;

}(window));
