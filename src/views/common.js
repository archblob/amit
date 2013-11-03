/*
 * Copyright (c) 2013 Csernik Flaviu Andrei
 *
 * See the file LICENSE.txt for copying permission.
 *
 */

"use strict";

window.requestAnimationFrame =
  window.requestAnimationFrame || window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var defaultPeek = {
  note : {
    name : "I",
    frequency : 0.00
  },
  cents : 0,
  frequency : 0.00
};

function fontStringPX(size, name) {
  return size + "px " + name;
}

function TunerView(containerID) {
  var canvases = []
    , reqCvs   = 0
    , viewType
    , viewContainer = document.getElementById(containerID)
    , viewWrapper   = document.createElement("div")
    ;
    
  viewWrapper.id = "tunerWrapper"
  /* TODO: check to see if the container is found. */

  Object.defineProperties(this, {
    "viewType" : {
        enumerable   : true
      , configurable : false
      , get : function () {
          return viewType;
        }
      , set : function (vT) {
          /* TODO: checks if it is a function and
           * and methods has the necessary methods.
           */
          viewType = vT;
          /* TODO: check to see it it's a natural number */
          reqCvs   = viewType.requiredCVS;
          var depth = canvases.length;

          while (depth != reqCvs) {
            if (depth < reqCvs) {
              canvases[depth] = document.createElement("canvas");
              depth += 1;
            } else {
              viewWrapper.removeChild(canvases[depth]);
              canvases.pop();
              depth -= 1;
            }
          }

          for (cvs in canvases) {
            viewWrapper.appendChild(canvases[cvs]);
          }

          viewContainer.appendChild(viewWrapper);

          viewType.setCVS(canvases);
          viewType.start();
        }
    }
  })

}
