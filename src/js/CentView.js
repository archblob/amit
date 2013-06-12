/*
 * Color Scheme :
 * green = rgb(122,153,66);
 * black = rgb(58,58,58);
 * white = rgb(227,227,227);
 * red   = rgb(140,46,46);
 * blue  = rgb(44,114,158);
 */


function CentsView(canvasID) {
      this.canvas = document.getElementById(canvasID);
      this.ctx    = this.canvas.getContext('2d');
      
      this.centerX       = this.canvas.width / 2;
      this.centerY       = this.canvas.height;
      this.circumference = 1000;
      this.radius        = this.circumference / (2*Math.PI);
      this.quadrantArc   = this.circumference / 4;
      
      this.color         = "rgb(58,58,58)";
      this.font          = "50px sans-serif";
      this.needleColor   = "rgb(58,58,58)";
      this.dotColor      = "rgb(58,58,58)";
      this.dotRadius     = 3;
      this.zeroDotColor  = "rgb(44,114,158)";
      this.zeroDotRadius = 5;
      this.markStep      = 50;
};

CentsView.prototype.background = function() {
  /* ** helper arc ***
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius,Math.PI,0,false);
    this.ctx.strokeStyle = "rgba(0,0,0,0.1)";
    this.ctx.stroke();
  */
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

CentsView.prototype.update = function(peek) {
  this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

  this.background();

  this.ctx.font      = this.font;
  this.ctx.fillStyle = this.color;
  this.ctx.fillText(peek.note.name,20,50);

  var scaledCents = peek.cents / 100 * this.quadrantArc;
  var arc         = this.quadrantArc - scaledCents;
  var alfa        = arc / this.radius;

  var x = this.centerX + this.radius * Math.cos(alfa);
  var y = this.centerY - this.radius * Math.sin(alfa);

  this.ctx.beginPath();
  this.ctx.moveTo(this.centerX,this.centerY);
  this.ctx.lineTo(x,y);
  this.ctx.strokeStyle = this.needleColor;
  this.ctx.stroke();
};