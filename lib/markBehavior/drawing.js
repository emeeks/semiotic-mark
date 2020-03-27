"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.pathStr = pathStr;
exports.circlePath = circlePath;
exports.rectPath = rectPath;
exports.linePath = linePath;
exports.generateSVG = generateSVG;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//All generic line constructors expect a projected coordinates array with x & y coordinates, if there are no y1 & x1 coordinates then it defaults to 0-width
function roundToTenth(number) {
  return Math.round(number * 10) / 10;
}

function pathStr(_ref) {
  var x = _ref.x,
      y = _ref.y,
      width = _ref.width,
      height = _ref.height,
      cx = _ref.cx,
      cy = _ref.cy,
      r = _ref.r;

  if (cx !== undefined) {
    return ["M", roundToTenth(cx - r), roundToTenth(cy), "a", r, r, 0, 1, 0, r * 2, 0, "a", r, r, 0, 1, 0, -(r * 2), 0].join(" ") + "Z";
  }
  return ["M", roundToTenth(x), roundToTenth(y), "h", width, "v", height, "h", -width, "v", -height].join(" ") + "Z";
}

function circlePath(cx, cy, r) {
  return pathStr({ cx: cx, cy: cy, r: r });
}

function rectPath(x, y, width, height) {
  return pathStr({ x: x, y: y, width: width, height: height });
}

function linePath(x1, x2, y1, y2) {
  return "M" + x1 + "," + y1 + "L" + x2 + "," + y2 + "L";
}

function generateSVG(props, className) {
  var markType = props.markType;
  var renderMode = props.renderMode;

  var cloneProps = _extends({}, props);
  delete cloneProps.markType;
  delete cloneProps.renderMode;
  delete cloneProps.resetAfter;
  delete cloneProps.droppable;
  delete cloneProps.nid;
  delete cloneProps.dropFunction;
  delete cloneProps.context;
  delete cloneProps.updateContext;
  delete cloneProps.parameters;
  delete cloneProps.lineDataAccessor;
  delete cloneProps.customAccessors;
  delete cloneProps.interpolate;
  delete cloneProps.forceUpdate;
  delete cloneProps.searchIterations;
  delete cloneProps.simpleInterpolate;
  delete cloneProps.transitionDuration;
  delete cloneProps.tx;
  delete cloneProps.ty;
  delete cloneProps.customTween;
  delete cloneProps.sketchyGenerator;

  //        let transform = cloneProps['transform'];
  if (props.draggable) {
    delete cloneProps.transform;
  }

  cloneProps.className = className;

  var actualSVG = null;

  if (renderMode === "forcePath" && markType === "circle") {
    cloneProps.d = circlePath(cloneProps.cx || 0, cloneProps.cy || 0, cloneProps.r);
    markType = "path";
    actualSVG = _react2.default.createElement(markType, cloneProps);
  } else if (renderMode === "forcePath" && markType === "rect") {
    cloneProps.d = rectPath(cloneProps.x || 0, cloneProps.y || 0, cloneProps.width, cloneProps.height);
    markType = "path";
    actualSVG = _react2.default.createElement(markType, cloneProps);
  } else {
    if (props.markType === "text" && _typeof(cloneProps.children) !== "object") {
      cloneProps.children = _react2.default.createElement(
        "tspan",
        null,
        cloneProps.children
      );
    }
    actualSVG = _react2.default.createElement(markType, cloneProps);
  }
  return actualSVG;
}