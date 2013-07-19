/*
 * Copyright (c) 2013 Csernik Flaviu Andrei
 *
 * See the file LICENSE.txt for copying permission.
 * 
 */

"use strict";

function PropertyNotInitialized(obj, propName) {
  this.property = propName;
  this.obj      = obj;
}

PropertyNotInitialized.prototype.toString = function () {
  return this.obj + " : " + this.property + " not initialized.";
};