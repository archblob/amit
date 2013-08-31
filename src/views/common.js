/*
 * Copyright (c) 2013 Csernik Flaviu Andrei
 *
 * See the file LICENSE.txt for copying permission.
 *
 */

window.requestAnimationFrame =
    window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

/* default color scheme */
var green = "rgb(122,153,66)";
var black = "rgb(58,58,58)";
var lightBlack = "rgba(58,58,58, 0.2)";
var white = "rgb(227,227,227)";
var red   = "rgb(140,46,46)";
var blue  = "rgb(44,114,158)";

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
