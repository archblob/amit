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

var ViewContextAndStyle = (function () {

  var defaultPeek = {
      note : {
        name : "I",
        frequency : 0.00
      },
      cents : 0,
      frequency : 0.00
  };

  function ViewContextAndStyle (containerID) {

    var _cvs = document.createElement("canvas");
    _cvs.id = "gtunerView";

    document.getElementById(containerID).appendChild(_cvs);

    var _ctx = _cvs.getContext("2d");

    var _peek  = defaultPeek;
    var _color = black;

    _ctx.fillStyle   = _color;
    _ctx.strokeStyle = _color;

    var _tunedColor    = green;
    var _notTunedColor = red;

    var _noteFontSize = 50;
    var _freqFontSize = 20;
    var _noteFontName = "sans-serif";
    var _freqFontName = "sans-serif";
      
    var _noteFont = _noteFontSize + "px " + _noteFontName;
    var _freqFont = _freqFontSize + "px " + _freqFontName;

    Object.defineProperties(this, {
      "cvs" : {
        value        : _cvs,
        configurable : false,
        enumerable   : false,
        writable     : false
      },
      "ctx" : {
        value        : _ctx,
        configurable : false,
        enumerable   : false,
        writable     : false
      },
      "peek" : {
        value        : _peek,
        configurable : false,
        enumerable   : true,
        writable     : true
      },
      "color" : {
        configurable : false,
        enumerable   : true,
        get : function () {
          return _color;
        },
        set : function (value) {
          _color = value;

          _ctx.fillStyle   = _color;
          _ctx.strokeStyle = _color;
        }
      },
      "tunedColor" : {
        configurable : false,
        enumerable   : true,
        get : function () {
          return _tunedColor;
        },
        set : function (value) {
          _tunedColor = value;
        }
      },
      "notTunedColor" : {
        configurable : false,
        enumerable   : true,
        get : function () {
          return _notTunedColor;
        },
        set : function (value) {
          _nottunedColor = value;
        }
      },
      "noteFont" : {/* TODO : throw exception when someone tries to set */
        configurable : false,
        enumerable   : false,
        get          : function () {
          return _noteFont;
        }
      },
      "freqFont" : {
        configurable : false,
        enumerable   : false,
        get          : function () {
          return _freqFont;
        }
      },
      "noteFontSize" : {
        configurable : false,
        enumerable   : true,
        set          : function (val) {
          _noteFontSize = val;
          _noteFont = _noteFontSize + "px " + _noteFontName;
        },
        get          : function () {
          return _noteFontSize;
        }
      },
      "freqFontSize" : {
        configurable : false,
        enumerable   : true,
        set          : function (val) {
          _freqFontSize = val;
          _freqFont = _freqFontSize + "px " + _freqFontName;
        },
        get          : function () {
          return _freqFontSize;
        }
      },
      "noteFontName" : {
        configurable : false,
        enumerable   : true,
        set          : function (val) {
          _noteFontName = val;
          _noteFont = _noteFontSize + "px " + _noteFontName;
        },
        get          : function () {
          return _noteFontName;
        }
      },
      "freqFontName" : {
        configurable : false,
        enumerable   : true,
        set          : function (val) {
          _freqFontName = val;
          _freqFont = _freqFontSize + "px " + _freqFontName;
        },
        get          : function () {
          return _freqFontName;
        }
      }
    });
  }

  return ViewContextAndStyle;

}());