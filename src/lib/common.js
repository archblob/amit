/*
 * Copyright (c) 2013 Csernik Flaviu Andrei
 *
 * See the file LICENSE.txt for copying permission.
 * 
 */

"use strict";

function PropertyNotInitialized(propName) {
  this.property = propName;
}

PropertyNotInitialized.prototype.toString = function () {
  return "Property " + this.property + " not initialized.";
};