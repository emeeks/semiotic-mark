import React from "react";
import { select } from "d3-selection";
import "d3-transition";

import { generateSVG } from "./markBehavior/drawing";

import {
  attributeTransitionWhitelist,
  reactCSSNameStyleHash,
  redrawSketchyList,
  differentD
} from "./constants/markTransition";

function generateSketchyHash(props) {
  let { style = {} } = props;
  let sketchyHash = "";
  redrawSketchyList.forEach(d => {
    sketchyHash += `-${style[d] || props[d]}`;
  });
  return sketchyHash;
}

const updateSketchy = (nextProps, oldSketchyHash) => {

  const RoughGenerator = nextProps.sketchyGenerator

  const renderOptions =
    nextProps.renderMode !== null && typeof nextProps.renderMode === "object"
      ? nextProps.renderMode
      : { renderMode: nextProps.renderMode };

  const sketchyHash =
    renderOptions.renderMode === "sketchy" && generateSketchyHash(nextProps);
  if (RoughGenerator && sketchyHash && sketchyHash !== oldSketchyHash) {
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

    const roughGenerator = RoughGenerator(
      {},
      { width: 1000, height: 1000 }
    );
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
            (nextProps.x || 0) + nextProps.width / 2,
            (nextProps.y || 0) + nextProps.width / 2,
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
      .forEach(({ d, fill, stroke, strokeWidth, pattern }, i) => {
        if (pattern) {
          const roughRandomID = `rough-${Math.random()}`;
          roughPieces.push(
            <pattern
              key={`pattern-${i}`}
              id={roughRandomID}
              x={pattern.x}
              y={pattern.y}
              height={pattern.height}
              width={pattern.width}
              viewBox={pattern.viewBox}
            >
              <path
                key={`pattern-path-${i}`}
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
            key={`path-${i}`}
            d={d}
            style={{
              fill: fill,
              stroke: stroke,
              strokeWidth: strokeWidth
            }}
            transform={nextProps.transform}
          />
        );
      });

    return {
      sketchyHash: sketchyHash,
      sketchyFill: roughPieces
    }
  }
  return null
}


class Mark extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sketchyFill: undefined,
      sketchyHash: "",
      ...updateSketchy(props, "")
    };

  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return updateSketchy(nextProps, prevState.sketchyHash)
  }

  shouldComponentUpdate(nextProps) {
    if (
      nextProps.renderMode ||
      this.props.renderMode ||
      this.props.markType !== nextProps.markType ||
      this.state.dragging ||
      this.props.forceUpdate ||
      nextProps.forceUpdate ||
      this.props.className !== nextProps.className ||
      this.props.children !== nextProps.children ||
      (this.props.customTween && !nextProps.customTween) ||
      (!this.props.customTween && nextProps.customTween)
    ) {
      return true;
    }

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
      : { default: defaultDuration, ...transitionDuration };

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
        if (newProp === "d" && nextProps.customTween) {
          select(node)
            .select("*")
            .attr(
              "d",
              nextProps.customTween.fn(
                nextProps.customTween.props,
                nextProps.customTween.props
              )(1)
            );
        } else {
          select(node)
            .select("*")
            .attr(adjustedPropName(newProp), cloneProps[newProp]);
        }
      } else {
        const {
          default: defaultDur,
          [newProp]: appliedDuration = defaultDur
        } = transitionDuration;

        if (newProp === "d" && nextProps.customTween) {
          const initialTweenProps = { ...this.props.customTween.props };
          const nextTweenProps = { ...nextProps.customTween.props };
          select(node)
            .select("*")
            .transition(adjustedPropName("d"))
            .duration(appliedDuration)
            .attrTween("d", () => {
              return nextProps.customTween.fn(
                initialTweenProps,
                nextTweenProps
              );
            });
        } else {
          select(node)
            .select("*")
            .transition(adjustedPropName(newProp))
            .duration(appliedDuration)
            .attr(adjustedPropName(newProp), cloneProps[newProp]);
        }
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

  render() {
    let className = this.props.className || "";

    const actualSVG =
      ((this.props.renderMode === "sketchy" ||
        (this.props.renderMode &&
          this.props.renderMode.renderMode === "sketchy")) &&
        this.state.sketchyFill) ||
      generateSVG(this.props, className);

    return (
      <g
        ref={node => (this.node = node)}
        className={className}
        aria-label={this.props["aria-label"]}
      >
        {actualSVG}
      </g>
    );

  }
}

export default Mark;
