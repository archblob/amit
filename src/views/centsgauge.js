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
      , centerY       = this.cvs.height - 10
      , radius        = 160
      , circumference = twoPI * radius
      , quadrantArc   = circumference / 4
      , tickWidth     = 2
      , maxTickWidth  = quadrantArc / mxCents
      , tickLength    = 16
      , markStep      = 10
      , _bgCVS        = document.createElement("canvas")
      , _bgCTX        = _bgCVS.getContext("2d")
      , dCents        = 0
      , totalSteps    = 30
      , animStep      = 1
      , dt            = 1 /* seconds */
      , mxSteps       = dt * totalSteps
      ;

      _bgCVS.id = "gtunerViewBg";

      document.getElementById(containerID).appendChild(_bgCVS);

      _bgCVS.width  = _width;
      _bgCVS.height = _height;

      _bgCVS.style.position = "absolute";
      _bgCVS.style.zIndex   = 0;

      _bgCTX.fillStyle   = this.color;
      _bgCTX.strokeStyle = this.color;

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
      , "tickWidth" : {
           configurable : false
         , enumerable   : true
         , get : function () {
             return tickWidth;
           }
         , set : function (val) {

             if (val <= maxTickWidth) {
               tickWidth = val;
             }

             this.background();
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
            maxTickWidth  = quadrantArc / mxCents

            this.background();
        }
      }
    });

    Object.defineProperties(CentsGauge.prototype, {
        "background" : {
          value : function() {

            var unitStep = quadrantArc / mxCents
              , arc      = quadrantArc - unitStep
              , halfMark = markStep / 2
              , c        = mxCents - 1
              , currentTickLength = tickLength
              , alfa
              , y0
              , y1
              , xc0
              , xc1
              , yc0
              , yc1
              , unitTickLength = tickLength / 3
              , halfTickLength = tickLength / 1.5
              , sTickLength    = currentTickLength / 2
              ;

            _bgCTX.beginPath();
            _bgCTX.arc(centerX,centerY,10,0,twoPI,false);
            _bgCTX.fill();

            _bgCTX.beginPath();
            _bgCTX.lineWidth = tickWidth;

            _bgCTX.moveTo(centerX, centerY - radius - sTickLength);
            _bgCTX.lineTo(centerX, centerY - radius + sTickLength);

            while (c >= 0) {

              if (c % markStep == 0) {
                currentTickLength = tickLength;
              } else if (c % halfMark == 0) {
                currentTickLength = halfTickLength;
              } else {
                currentTickLength = unitTickLength;
              }

              alfa = arc / radius;

              sTickLength = currentTickLength / 2;

              xc0 = (radius + sTickLength) * Math.cos(alfa);
              xc1 = (radius - sTickLength) * Math.cos(alfa);
              yc0 = (radius + sTickLength) * Math.sin(alfa);
              yc1 = (radius - sTickLength) * Math.sin(alfa);

              y0 = centerY - yc0;
              y1 = centerY - yc1;

              _bgCTX.moveTo(centerX - xc0, y0);
              _bgCTX.lineTo(centerX - xc1, y1);

              _bgCTX.moveTo(centerX + xc0, y0);
              _bgCTX.lineTo(centerX + xc1, y1);

              arc -= unitStep;
              c   -= 1;
            }

            _bgCTX.stroke();
          }
        , enumerable   : false
        , configurable : false
        , writable     : false
        }
      , "run" : {
          value : function() {

            var arc  = quadrantArc - (dCents * quadrantArc / mxCents)
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


            if (dCents > this.peek.cents) {
              dCents -= animStep;

              if (dCents < this.peek.cents) {
                dCents = this.peek.cents;
              }
            } else {
              dCents += animStep;

              if (dCents > this.peek.cents) {
                dCents = this.peek.cents;
              }
            }
            window.requestAnimationFrame(this.run.bind(this));
          }
        , enumerable   : false
        , configurable : false
        , writable     : false
        }
      , "update" : {
          value : function (element) {

            if (element.peek) {

            this.peek = element.peek;

            tmpAnimStep = Math.abs(dCents - Math.abs(this.peek.cents)) / mxSteps;

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
