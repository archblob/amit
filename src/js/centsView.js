/*
 * Color Scheme :
 * green = rgb(122,153,66);
 * black = rgb(58,58,58);
 * white = rgb(227,227,227);
 * red   = rgb(140,46,46);
 * blue  = rgb(44,114,158);
 */

window.requestAnimationFrame = window.webkitRequestAnimationFrame;

function CentsView(containerID, getData) {
      this.canvas        = document.createElement('canvas');
      this.canvas.id     = 'gtunerView'; 
      this.canvas.width  = 400;
      this.canvas.height = 200;

      document.getElementById(containerID).appendChild(this.canvas);

      this.ctx    = this.canvas.getContext('2d');

      this.getData = getData;

      this.lastCents     = 0;
      this.cents         = 0;
      this.noteName      = "Test";
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

  var arc  = this.quadrantArc - this.cents;
  var alfa = arc / this.radius;

  var x = this.centerX + this.radius * Math.cos(alfa);
  var y = this.centerY - this.radius * Math.sin(alfa);

  this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

  this.background();

  this.ctx.font      = this.noteFont;
  this.ctx.fillStyle = this.color;
  this.ctx.fillText(this.noteName,20,50);

  this.ctx.font = this.freqFont;
  this.ctx.fillText(this.frequency.toFixed(2) + " Hz",this.canvas.width-110,40);

  this.ctx.beginPath();
  this.ctx.moveTo(this.centerX,this.centerY);
  this.ctx.lineTo(x,y);
  this.ctx.strokeStyle = this.needleColor;
  this.ctx.stroke();

  window.requestAnimationFrame(this.run.bind(this));
};

CentsView.prototype.update = function(){
  /* To BE IMPLEMENTED, SMOOTH NEEDLE
  var peek        = event.data.peek;
  var lastCents   = centsView.lastCents;
  var scaledCents = Math.floor(peek.cents / 50 * centsView.quadrantArc);
  var step = (scaledCents - lastCents) / Math.abs(scaledCents - lastCents);
  var st;

  function condition(i){
    if (lastCents < scaledCents){
      return i < scaledCents;
    } else {
       return i > scaledCents;
    }
  }

  function loop(){
    if(condition(lastCents)){
      peek.cents = lastCents;
      centsView.update(peek);
       lastCents += step;
    } else {
      window.clearInterval(st);
    }
  }
  */
  var res = this.getData();
  
  if(res){
    var peek = res.peek;
    
    this.cents     = peek.cents;
    this.frequency = peek.frequency;
    this.noteName  = peek.note.name;
  }
  
  window.setTimeout(this.update.bind(this),100);
};
