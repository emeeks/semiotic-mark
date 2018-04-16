import React from "react";
import { select } from "d3-selection";
import "d3-transition";

import { generateSVG } from "./markBehavior/drawing";
import { generator } from "roughjs";

import {
  attributeTransitionWhitelist,
  reactCSSNameStyleHash,
  redrawSketchyList,
  differentD
} from "./constants/markTransition";

import PropTypes from "prop-types";

function generateSketchyHash(props) {
  let { style = {} } = props;
  let sketchyHash = "";
  redrawSketchyList.forEach(d => {
    sketchyHash += `-${style[d] || props[d]}`;
  });
  return sketchyHash;
}

class Mark extends React.Component {
  constructor(props) {
    super(props);
    this._mouseup = this._mouseup.bind(this);
    this._mousedown = this._mousedown.bind(this);
    this._mousemove = this._mousemove.bind(this);

    this.state = {
      translate: [0, 0],
      mouseOrigin: [],
      translateOrigin: [0, 0],
      dragging: false,
      uiUpdate: false,
      sketchyFill: undefined,
      sketchyHash: ""
    };
  }

  componentWillReceiveProps(nextProps) {
    this.updateSketchy(nextProps);
  }
  componentWillMount() {
    this.updateSketchy(this.props);
  }

  updateSketchy(nextProps) {
    const renderOptions =
      nextProps.renderMode !== null && typeof nextProps.renderMode === "object"
        ? nextProps.renderMode
        : { renderMode: nextProps.renderMode };

    const sketchyHash =
      renderOptions.renderMode === "sketchy" && generateSketchyHash(nextProps);
    if (sketchyHash && sketchyHash !== this.state.sketchyHash) {
      const { style = {} } = nextProps;
      const {
        simplification = 0,
        curveStepCount = 9,
        fillStyle = "hachure",
        roughness = 1,
        bowing = 1,
        fillWeight = 1,
        hachureAngle = -41
      } = renderOptions;

      const roughGenerator = generator({}, { width: 1000, height: 1000 });
      let drawingInstructions;
      const roughOptions = {
        fill: style.fill || nextProps.fill,
        stroke: style.stroke || nextProps.stroke,
        strokeWidth: style.strokeWidth || nextProps.strokeWidth,
        fillStyle: fillStyle,
        roughness: roughness,
        bowing: bowing,
        fillWeight: fillWeight,
        hachureAngle: hachureAngle,
        hachureGap:
          renderOptions.hachureGap ||
          (style.fillOpacity && (5 - style.fillOpacity * 5) * fillWeight) ||
          fillWeight * 2,
        curveStepCount: curveStepCount,
        simplification: simplification
      };

      switch (nextProps.markType) {
        case "line":
          drawingInstructions = roughGenerator.line(
            nextProps.x1 || 0,
            nextProps.y1 || 0,
            nextProps.x2 || 0,
            nextProps.y2 || 0,
            roughOptions
          );
          break;
        case "rect":
          if (nextProps.rx || nextProps.ry) {
            drawingInstructions = roughGenerator.circle(
              nextProps.x || 0 + nextProps.width / 2,
              nextProps.y || 0 + nextProps.width / 2,
              nextProps.width,
              roughOptions
            );
          } else {
            drawingInstructions = roughGenerator.rectangle(
              nextProps.x || 0,
              nextProps.y || 0,
              nextProps.width,
              nextProps.height,
              roughOptions
            );
          }
          break;
        case "circle":
          drawingInstructions = roughGenerator.circle(
            nextProps.cx || 0,
            nextProps.cy || 0,
            nextProps.r * 2,
            roughOptions
          );
          break;
        case "ellipse":
          drawingInstructions = roughGenerator.ellipse(
            nextProps.x || 0,
            nextProps.y || 0,
            nextProps.width,
            nextProps.height,
            roughOptions
          );
          break;
        case "polygon":
          drawingInstructions = roughGenerator.polygon(
            nextProps.points,
            roughOptions
          );
          break;
        case "path":
          drawingInstructions = roughGenerator.path(nextProps.d, roughOptions);
          break;
      }

      const roughPieces = [];
      roughGenerator
        .toPaths(drawingInstructions)
        .forEach(({ d, fill, stroke, strokeWidth, pattern }) => {
          if (pattern) {
            const roughRandomID = `rough-${Math.random()}`;
            roughPieces.push(
              <pattern
                id={roughRandomID}
                x={pattern.x}
                y={pattern.y}
                height={pattern.height}
                width={pattern.width}
                viewBox={pattern.viewBox}
              >
                <path
                  d={pattern.path.d}
                  style={{
                    fill: pattern.path.fill,
                    stroke: pattern.path.stroke,
                    strokeWidth: pattern.path.strokeWidth
                  }}
                />
              </pattern>
            );
            fill = `url(#${roughRandomID})`;
          }
          roughPieces.push(
            <path
              d={d}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              transform={nextProps.transform}
            />
          );
        });

      this.setState({
        sketchyHash: sketchyHash,
        sketchyFill: roughPieces
      });
    }
  }

  shouldComponentUpdate(nextProps) {
    //data-driven transition time?
    if (
      nextProps.renderMode ||
      this.props.renderMode ||
      this.props.markType !== nextProps.markType ||
      this.state.dragging ||
      this.props.forceUpdate ||
      nextProps.forceUpdate ||
      this.props.className !== nextProps.className ||
      this.props.children !== nextProps.children
    ) {
      return true;
    }

    const canvas =
      (this.props.canvas !== true && this.props.canvas) ||
      (this.context && this.context.canvas);

    let node = this.node;

    const actualSVG = generateSVG(nextProps, nextProps.className);
    let cloneProps = actualSVG.props;

    if (!cloneProps) {
      return true;
    }

    let { transitionDuration = {} } = nextProps;
    const isDefault = typeof transitionDuration === "number";
    const defaultDuration = isDefault ? transitionDuration : 1000;
    transitionDuration = isDefault
      ? { default: defaultDuration }
      : Object.assign({ default: defaultDuration }, transitionDuration);

    const newProps = Object.keys(cloneProps).filter(d => d !== "style");
    const oldProps = Object.keys(this.props).filter(
      d => d !== "style" && !newProps.find(p => p === d)
    );

    const hasTransition = select(node).select("*").transition;

    function adjustedPropName(propname) {
      return reactCSSNameStyleHash[propname] || propname;
    }

    oldProps.forEach(oldProp => {
      if (oldProp !== "style") {
        select(node)
          .select("*")
          .attr(adjustedPropName(oldProp), undefined);
      }
    });

    newProps.forEach(newProp => {
      if (
        !hasTransition ||
        !attributeTransitionWhitelist.find(d => d === newProp) ||
        (newProp === "d" && differentD(cloneProps.d, this.props.d))
      ) {
        select(node)
          .select("*")
          .attr(adjustedPropName(newProp), cloneProps[newProp]);
      } else {
        const {
          default: defaultDur,
          [newProp]: appliedDuration = defaultDur
        } = transitionDuration;

        select(node)
          .select("*")
          .transition(adjustedPropName(newProp))
          .duration(appliedDuration)
          .attr(adjustedPropName(newProp), cloneProps[newProp]);
      }
    });

    const newStyleProps = Object.keys(cloneProps.style || {});
    const oldStyleProps = Object.keys(this.props.style || {}).filter(
      d => !newStyleProps.find(p => p === d)
    );

    oldStyleProps.forEach(oldProp => {
      select(node)
        .select("*")
        .style(adjustedPropName(oldProp), undefined);
    });

    newStyleProps.forEach(newProp => {
      if (!hasTransition) {
        select(node)
          .select("*")
          .style(adjustedPropName(newProp), cloneProps.style[newProp]);
      } else {
        const {
          default: defaultDur,
          [newProp]: appliedDuration = defaultDur
        } = transitionDuration;

        select(node)
          .select("*")
          .transition(adjustedPropName(newProp))
          .duration(appliedDuration)
          .style(adjustedPropName(newProp), cloneProps.style[newProp]);
      }
    });

    return false;
  }

  _mouseup() {
    document.onmousemove = null;

    let finalTranslate = [0, 0];
    if (!this.props.resetAfter) finalTranslate = this.state.translate;

    this.setState({
      dragging: false,
      translate: finalTranslate,
      uiUpdate: false
    });
    if (
      this.props.dropFunction &&
      this.props.context &&
      this.props.context.dragSource
    ) {
      this.props.dropFunction(this.props.context.dragSource.props, this.props);
      this.props.updateContext("dragSource", undefined);
    }
  }

  _mousedown(event) {
    this.setState({
      mouseOrigin: [event.pageX, event.pageY],
      translateOrigin: this.state.translate,
      dragging: true
    });
    document.onmouseup = this._mouseup;
    document.onmousemove = this._mousemove;
  }

  _mousemove(event) {
    let xAdjust = this.props.freezeX ? 0 : 1;
    let yAdjust = this.props.freezeY ? 0 : 1;

    let adjustedPosition = [
      event.pageX - this.state.mouseOrigin[0],
      event.pageY - this.state.mouseOrigin[1]
    ];
    let adjustedTranslate = [
      (adjustedPosition[0] + this.state.translateOrigin[0]) * xAdjust,
      (adjustedPosition[1] + this.state.translateOrigin[1]) * yAdjust
    ];
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
  render() {
    let className = this.props.className || "";

    let mouseIn = null;
    let mouseOut = null;

    const actualSVG =
      ((this.props.renderMode === "sketchy" ||
        (this.props.renderMode &&
          this.props.renderMode.renderMode === "sketchy")) &&
        this.state.sketchyFill) ||
      generateSVG(this.props, className);

    if (this.props.draggable) {
      return (
        <g
          ref={node => (this.node = node)}
          className={className}
          onMouseEnter={mouseIn}
          onMouseOut={mouseOut}
          onDoubleClick={this._doubleclick}
          style={{
            pointerEvents:
              this.props.dropFunction && this.state.dragging ? "none" : "all"
          }}
          onMouseDown={this._mousedown}
          onMouseUp={this._mouseup}
          transform={"translate(" + this.state.translate + ")"}
        >
          {actualSVG}
        </g>
      );
    } else {
      return (
        <g
          ref={node => (this.node = node)}
          className={className}
          onMouseEnter={mouseIn}
          onMouseOut={mouseOut}
        >
          {actualSVG}
        </g>
      );
    }
  }
}

Mark.propTypes = {
  markType: PropTypes.string.isRequired,
  forceUpdate: PropTypes.bool,
  renderMode: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  draggable: PropTypes.bool,
  dropFunction: PropTypes.func,
  resetAfter: PropTypes.bool,
  freezeX: PropTypes.bool,
  freezeY: PropTypes.bool,
  context: PropTypes.object,
  updateContext: PropTypes.func,
  className: PropTypes.string
};

Mark.contextTypes = {
  canvas: PropTypes.object
};

export default Mark;
