import React from "react";
import { select } from "d3-selection";
import "d3-transition";

import { generateSVG } from "./markBehavior/drawing";

import {
  attributeTransitionWhitelist,
  reactCSSNameStyleHash,
  differentD
} from "./constants/markTransition";

import PropTypes from "prop-types";

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
      uiUpdate: false
    };
  }

  shouldComponentUpdate(nextProps) {
    //data-driven transition time?
    if (
      this.props.markType !== nextProps.markType ||
      this.state.dragging ||
      this.props.forceUpdate ||
      nextProps.forceUpdate ||
      this.props.renderMode !== nextProps.renderMode ||
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

    const actualSVG = generateSVG(this.props, className);

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
