/*
 * Copyright (c) 2013 Csernik Flaviu Andrei
 *
 * See the file LICENSE.txt for copying permission.
 * 
 */

"use strict";

window.AudioContext = window.AudioContext || window.webkitAudioContext;

function PropertyNotInitialized(obj, propName) {
  this.property = propName;
  this.obj      = obj;
}

PropertyNotInitialized.prototype.toString = function () {
  return this.obj + " : " + this.property + " not initialized.";
};

function isInteger(n) {
   return typeof n === "number" && Math.floor(n) == n;
}

function checkNat(callerName, n) {
  
  if (!isInteger) {
    throw new TypeError("downsampleFactor accepts an integer but" +
                        "given type is " + typeof value);
  }

  if (value <= 0) {
    throw new RangeError("downsampleFactor must be positive." +
                         "given number is not: " + value);
  }

}
