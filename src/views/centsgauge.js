var CentsGauge = (function (containerID) {

  function CentsGauge() {

    ViewContextAndStyle.apply(this,arguments);

    var _width  = 400
      , _height = 200
      , twoPI   = 2 * Math.PI
      , mxCents = 50
      ;

    this.cvs.width  = _width;
    this.cvs.height = _height;

    this.cvs.style.position = "absolute";
    this.cvs.style.zIndex = 1;

    var centerX       = this.cvs.width / 2
      , centerY       = this.cvs.height
      , radius        = 160
      , circumference = twoPI * radius
      , quadrantArc   = circumference / 4
      , dotRadius     = 3
      , zeroDotRadius = 5
      , markStep      = 10
      , _bgCVS        = document.createElement("canvas")
      , _bgCTX        = _bgCVS.getContext("2d")
      ;

      _bgCVS.id = "gtunerViewBg";

      document.getElementById(containerID).appendChild(_bgCVS);

      _bgCVS.width  = _width;
      _bgCVS.height = _height;

      _bgCVS.style.position = "absolute";
      _bgCVS.style.zIndex   = 0;

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

            this.background();
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
            centerY         = this.cvs.height;

            this.background();
          }
        }
      , "dotRadius" : {
           configurable : false
         , enumerable   : true
         , get : function () {
             return dotRadius;
           }
         , set : function (val) {
             dotRadius = val;

             this.background();
           }
        }
      , "zeroDotRadius" : {
           configurable : false
         , enumerable   : true
         , get : function () {
             return zeroDotRadius;
         }
         , set : function (val) {
             zeroDotRadius = val;

             this.background();
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

            this.background();
          }
        }
      , "radius" : {
          enumerable   : true
        , configurable : false
        , get          : function () {
            return radius;
          }
        , set : function (r) {
            radius = r;

            circumference = twoPI * radius;
            quadrantArc   = circumference / 4;

            this.background();
        }
      }
    });

    Object.defineProperties(CentsGauge.prototype, {
        "background" : {
          value : function() {

            var scaledStep = (markStep * quadrantArc / mxCents)
              , arc        = quadrantArc - scaledStep
              , alfa
              , x
              , xc
              , xs
              , y
              ;

            _bgCTX.beginPath();
            _bgCTX.arc(centerX,centerY,10,0,twoPI,false);
            _bgCTX.arc(centerX,centerY - radius,zeroDotRadius,0,twoPI,true);
            _bgCTX.fillStyle = this.color;

            while (arc > -1) {

              alfa = arc / radius;
              xc   = radius * Math.cos(alfa);

              x  = centerX - xc;
              xs = centerX + xc;
              y  = centerY - radius * Math.sin(alfa);

              _bgCTX.arc(x,y,dotRadius,0,twoPI,true);
              _bgCTX.arc(xs,y,dotRadius,0,twoPI,true);

              arc -= scaledStep;
            }

            _bgCTX.fill();
          }
        , enumerable   : false
        , configurable : false
        , writable     : false
        }
      , "run" : {
          value : function() {

            var arc  = quadrantArc - (this.peek.cents * quadrantArc / mxCents)
              , alfa = arc / radius
              , x = centerX + radius * Math.cos(alfa)
              , y = centerY - radius * Math.sin(alfa)
              ;

            this.ctx.clearRect(0,0,this.cvs.width,this.cvs.height);

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

    this.background();
  };

  if (!this.instance) {
    this.instance = new CentsGauge(containerID);
  } else {
    console.log("An instance of CentsGauge already exists.");
  }

  return this.instance;

});
