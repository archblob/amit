var CentsGauge = (function (containerID) {

  function CentsGauge() {

    ViewContextAndStyle.apply(this,arguments);

    var _width  = 400
      , _height = 200
      ;
    
    this.cvs.width  = 400;
    this.cvs.height = 200;

    var centerX       = this.cvs.width / 2
      , centerY       = this.cvs.height
      , radius        = 160
      , circumference = 2 * Math.PI * radius
      , quadrantArc   = circumference / 4
      , dotRadius     = 3
      , zeroDotRadius = 5
      , markStep      = 50
      ;

    Object.defineProperties(this, {
        "width" : {
          enumerable   : true
        , configurable : false
        , get : function () {
            return _width;
          }
        , set : function (val) {
            _width = val;

            this.cvs.width = _width;
            centerX  = this.cvs.width / 2;

          }
        }
      , "height" : {
          enumerable   : true
        , configurable : false
        , get : function () {
            return _height;
          }
        , set : function (val) {
            _height = val;

            this.cvs.height = _height;
            centerY   = this.cvs.height;
          }
        }
      , "dotRadius" : {
           value        : dotRadius
         , configurable : false
         , enumerable   : true
         , writable     : true
        }
      , "zeroDotRadius" : {
           value        : zeroDotRadius
         , configurable : false
         , enumerable   : true
         , writable     : true
        }
      , "markStep" : {
          value        : markStep
        , configurable : false
        , enumerable   : true
        , writable     : true
        }
      , "radius" : {
          enumerable   : true
        , configurable : false
        , get          : function () {
            return radius;
          }
        , set : function (r) {
            radius = r;

            circumference = 2 * Math.PI * radius;
            quadrantArc   = circumference / 4;
        }
      }
    });

    Object.defineProperties(CentsGauge.prototype, {
        "background" : {
          value : function() {

            var arc;

            this.ctx.beginPath();
            this.ctx.arc(centerX,centerY,10,0,Math.PI,true);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();

            for (arc = 0; arc <= circumference / 2; arc += markStep) {
              var markRadius = dotRadius;
              var fillStyle  = this.color;

              this.ctx.beginPath();
              var alfa = arc / radius;

              if (arc == quadrantArc){
                markRadius = zeroDotRadius;
              }

              var x = centerX - radius * Math.cos(alfa);
              var y = centerY - radius * Math.sin(alfa);

              this.ctx.arc(x,y,markRadius,0,2*Math.PI,true);
              this.ctx.fillStyle = fillStyle;
              this.ctx.fill();
            }
          }
        , enumerable   : false
        , configurable : false
        , writable     : false
        }
      , "run" : {
          value : function() {

            var arc  = quadrantArc - this.peek.cents
              , alfa = arc / radius
              , x = centerX + radius * Math.cos(alfa)
              , y = centerY - radius * Math.sin(alfa)
              ;

            this.ctx.clearRect(0,0,this.cvs.width,this.cvs.height);

            this.background();

            this.ctx.font      = this.noteFont;
            this.ctx.fillStyle = this.color;
            this.ctx.fillText(this.peek.note.name,20,50);

            this.ctx.font = this.freqFont;
            this.ctx.fillText(this.peek.frequency.toFixed(2) + " Hz",this.cvs.width-110,40);

            this.ctx.beginPath();
            this.ctx.moveTo(centerX,centerY);
            this.ctx.lineTo(x,y);
            this.ctx.strokeStyle = this.color;
            this.ctx.stroke();

            window.requestAnimationFrame(this.run.bind(this));
          }
        , enumerable   : false
        , configurable : false
        , writable     : false
        }
      , "update" : {
          value : function (element) {

            this.peek = element.peek;

          }
        , enumerable   : false
        , configurable : false
        , writable     : false
        }
      }
    );
  };

  if (!this.instance) {
    this.instance = new CentsGauge(containerID);
  } else {
    console.log("An instance of CentsGauge already exists.");
  }

  return this.instance;

});