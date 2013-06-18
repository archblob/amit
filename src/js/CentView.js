/*
 * Color Scheme :
 * green = rgb(122,153,66);
 * black = rgb(58,58,58);
 * white = rgb(227,227,227);
 * red   = rgb(140,46,46);
 * blue  = rgb(44,114,158);
 */

window.requestAnimationFrame = window.webkitRequestAnimationFrame;

function CentsView(canvasID) {
      this.canvas = document.getElementById(canvasID);
      this.ctx    = this.canvas.getContext('2d');

      this.lastCents     = 0;
      this.cents         = 0;
      this.noteName      = "T";
      this.frequency     = 0.00;
      
      this.centerX       = this.canvas.width / 2;
      this.centerY       = this.canvas.height;
      this.circumference = 1000;
      this.radius        = this.circumference / (2*Math.PI);
      this.quadrantArc   = this.circumference / 4;
      
      this.color         = "rgb(58,58,58)";
      this.noteFont      = "50px sans-serif";
      this.freqFont      = "20px sans-serif";
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
  var self = this;

  var arc  = self.quadrantArc - this.cents;
  var alfa = arc / self.radius;

  var x = self.centerX + self.radius * Math.cos(alfa);
  var y = self.centerY - self.radius * Math.sin(alfa);

  self.ctx.clearRect(0,0,self.canvas.width,self.canvas.height);

  self.background();

  self.ctx.font      = self.noteFont;
  self.ctx.fillStyle = self.color;
  self.ctx.fillText(this.noteName,20,50);

  self.ctx.font = self.freqFont;
  self.ctx.fillText(self.frequency.toFixed(2) + " Hz",self.canvas.width-110,40);

  self.ctx.beginPath();
  self.ctx.moveTo(self.centerX,self.centerY);
  self.ctx.lineTo(x,y);
  self.ctx.strokeStyle = self.needleColor;
  self.ctx.stroke();

  window.requestAnimationFrame(this.run.bind(this));
};

CentsView.prototype.update = function(peek){
  this.cents     = peek.cents;
  this.frequency = peek.frequency;
  this.noteName  = peek.note.name;
}
