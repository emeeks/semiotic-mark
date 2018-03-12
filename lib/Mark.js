"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _d3Selection = require("d3-selection");

require("d3-transition");

var _drawing = require("./markBehavior/drawing");

var _markTransition = require("./constants/markTransition");

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Mark = function (_React$Component) {
  _inherits(Mark, _React$Component);

  function Mark(props) {
    _classCallCheck(this, Mark);

    var _this = _possibleConstructorReturn(this, (Mark.__proto__ || Object.getPrototypeOf(Mark)).call(this, props));

    _this._mouseup = _this._mouseup.bind(_this);
    _this._mousedown = _this._mousedown.bind(_this);
    _this._mousemove = _this._mousemove.bind(_this);

    _this.state = {
      translate: [0, 0],
      mouseOrigin: [],
      translateOrigin: [0, 0],
      dragging: false,
      uiUpdate: false
    };
    return _this;
  }

  _createClass(Mark, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps) {
      var _this2 = this;

      //data-driven transition time?
      if (this.props.markType !== nextProps.markType || this.state.dragging || this.props.forceUpdate || nextProps.forceUpdate || this.props.renderMode !== nextProps.renderMode || this.props.className !== nextProps.className || this.props.children !== nextProps.children) {
        return true;
      }

      var canvas = this.props.canvas !== true && this.props.canvas || this.context && this.context.canvas;

      var node = this.node;

      var actualSVG = (0, _drawing.generateSVG)(nextProps, nextProps.className);
      var cloneProps = actualSVG.props;

      if (!cloneProps) {
        return true;
      }

      var _nextProps$transition = nextProps.transitionDuration,
          transitionDuration = _nextProps$transition === undefined ? {} : _nextProps$transition;

      var isDefault = typeof transitionDuration === "number";
      var defaultDuration = isDefault ? transitionDuration : 1000;
      transitionDuration = isDefault ? { default: defaultDuration } : _extends({ default: defaultDuration }, transitionDuration);

      var newProps = Object.keys(cloneProps).filter(function (d) {
        return d !== "style";
      });
      var oldProps = Object.keys(this.props).filter(function (d) {
        return d !== "style" && !newProps.find(function (p) {
          return p === d;
        });
      });

      var hasTransition = (0, _d3Selection.select)(node).select("*").transition;

      function adjustedPropName(propname) {
        return _markTransition.reactCSSNameStyleHash[propname] || propname;
      }

      oldProps.forEach(function (oldProp) {
        if (oldProp !== "style") {
          (0, _d3Selection.select)(node).select("*").attr(adjustedPropName(oldProp), undefined);
        }
      });

      newProps.forEach(function (newProp) {
        if (!hasTransition || !_markTransition.attributeTransitionWhitelist.find(function (d) {
          return d === newProp;
        }) || newProp === "d" && (0, _markTransition.differentD)(cloneProps.d, _this2.props.d)) {
          (0, _d3Selection.select)(node).select("*").attr(adjustedPropName(newProp), cloneProps[newProp]);
        } else {
          var _transitionDuration = transitionDuration,
              defaultDur = _transitionDuration.default,
              _transitionDuration$n = _transitionDuration[newProp],
              appliedDuration = _transitionDuration$n === undefined ? defaultDur : _transitionDuration$n;


          (0, _d3Selection.select)(node).select("*").transition(adjustedPropName(newProp)).duration(appliedDuration).attr(adjustedPropName(newProp), cloneProps[newProp]);
        }
      });

      var newStyleProps = Object.keys(cloneProps.style || {});
      var oldStyleProps = Object.keys(this.props.style || {}).filter(function (d) {
        return !newStyleProps.find(function (p) {
          return p === d;
        });
      });

      oldStyleProps.forEach(function (oldProp) {
        (0, _d3Selection.select)(node).select("*").style(adjustedPropName(oldProp), undefined);
      });

      newStyleProps.forEach(function (newProp) {
        if (!hasTransition) {
          (0, _d3Selection.select)(node).select("*").style(adjustedPropName(newProp), cloneProps.style[newProp]);
        } else {
          var _transitionDuration2 = transitionDuration,
              defaultDur = _transitionDuration2.default,
              _transitionDuration2$ = _transitionDuration2[newProp],
              appliedDuration = _transitionDuration2$ === undefined ? defaultDur : _transitionDuration2$;


          (0, _d3Selection.select)(node).select("*").transition(adjustedPropName(newProp)).duration(appliedDuration).style(adjustedPropName(newProp), cloneProps.style[newProp]);
        }
      });

      return false;
    }
  }, {
    key: "_mouseup",
    value: function _mouseup() {
      document.onmousemove = null;

      var finalTranslate = [0, 0];
      if (!this.props.resetAfter) finalTranslate = this.state.translate;

      this.setState({
        dragging: false,
        translate: finalTranslate,
        uiUpdate: false
      });
      if (this.props.dropFunction && this.props.context && this.props.context.dragSource) {
        this.props.dropFunction(this.props.context.dragSource.props, this.props);
        this.props.updateContext("dragSource", undefined);
      }
    }
  }, {
    key: "_mousedown",
    value: function _mousedown(event) {
      this.setState({
        mouseOrigin: [event.pageX, event.pageY],
        translateOrigin: this.state.translate,
        dragging: true
      });
      document.onmouseup = this._mouseup;
      document.onmousemove = this._mousemove;
    }
  }, {
    key: "_mousemove",
    value: function _mousemove(event) {
      var xAdjust = this.props.freezeX ? 0 : 1;
      var yAdjust = this.props.freezeY ? 0 : 1;

      var adjustedPosition = [event.pageX - this.state.mouseOrigin[0], event.pageY - this.state.mouseOrigin[1]];
      var adjustedTranslate = [(adjustedPosition[0] + this.state.translateOrigin[0]) * xAdjust, (adjustedPosition[1] + this.state.translateOrigin[1]) * yAdjust];
      if (this.props.dropFunction && this.state.uiUpdate === false) {
        this.props.updateContext("dragSource", this);
        this.setState({
          translate: adjustedTranslate,
          uiUpdate: true,
          dragging: true
        });
      } else {
        this.setState({ translate: adjustedTranslate });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var className = this.props.className || "";

      var mouseIn = null;
      var mouseOut = null;

      var actualSVG = (0, _drawing.generateSVG)(this.props, className);

      if (this.props.draggable) {
        return _react2.default.createElement(
          "g",
          {
            ref: function ref(node) {
              return _this3.node = node;
            },
            className: className,
            onMouseEnter: mouseIn,
            onMouseOut: mouseOut,
            onDoubleClick: this._doubleclick,
            style: {
              pointerEvents: this.props.dropFunction && this.state.dragging ? "none" : "all"
            },
            onMouseDown: this._mousedown,
            onMouseUp: this._mouseup,
            transform: "translate(" + this.state.translate + ")"
          },
          actualSVG
        );
      } else {
        return _react2.default.createElement(
          "g",
          {
            ref: function ref(node) {
              return _this3.node = node;
            },
            className: className,
            onMouseEnter: mouseIn,
            onMouseOut: mouseOut
          },
          actualSVG
        );
      }
    }
  }]);

  return Mark;
}(_react2.default.Component);

Mark.propTypes = {
  markType: _propTypes2.default.string.isRequired,
  forceUpdate: _propTypes2.default.bool,
  renderMode: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
  draggable: _propTypes2.default.bool,
  dropFunction: _propTypes2.default.func,
  resetAfter: _propTypes2.default.bool,
  freezeX: _propTypes2.default.bool,
  freezeY: _propTypes2.default.bool,
  context: _propTypes2.default.object,
  updateContext: _propTypes2.default.func,
  className: _propTypes2.default.string
};

Mark.contextTypes = {
  canvas: _propTypes2.default.object
};

exports.default = Mark;
module.exports = exports['default'];