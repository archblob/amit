/*
 * Copyright (c) 2013 Csernik Flaviu Andrei
 *
 * See the file LICENSE.txt for copying permission.
 *
 */

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
