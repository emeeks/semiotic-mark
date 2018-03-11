"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var styleTransitionWhitelist = exports.styleTransitionWhitelist = ["strokeOpacity", "fillOpacity", "strokeWidth", "fill", "stroke", "opacity", "strokeDasharray"];

var attributeTransitionWhitelist = exports.attributeTransitionWhitelist = ["d", "height", "width", "transform", "x", "y", "cx", "cy", "x1", "x2", "y1", "y2", "rx", "ry", "r"].concat(styleTransitionWhitelist);

//TODO find React Everything to everything translater
var reactCSSNameStyleHash = exports.reactCSSNameStyleHash = {
  strokeWidth: "stroke-width",
  fillOpacity: "fill-opacity",
  strokeOpacity: "stroke-opacity",
  strokeDasharray: "stroke-dasharray"
};

var differentD = exports.differentD = function differentD(d, newD) {
  if (!d || !newD) {
    return true;
  }
  var lowerD = d.toLowerCase();
  var lowerNewD = newD.toLowerCase();

  if ((lowerD.match(/m/g) || []).length !== (lowerNewD.match(/m/g) || []).length) {
    return true;
  }

  if ((lowerD.match(/l/g) || []).length !== (lowerNewD.match(/l/g) || []).length) {
    return true;
  }

  if ((lowerD.match(/c/g) || []).length !== (lowerNewD.match(/c/g) || []).length) {
    return true;
  }

  if ((lowerD.match(/a/g) || []).length !== (lowerNewD.match(/a/g) || []).length) {
    return true;
  }

  return false;
};