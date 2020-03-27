import React from "react";
import DocumentComponent from "../layout/DocumentComponent";
import { Mark } from "../../components";
import { arc } from "d3-shape";
import { interpolateNumber } from "d3-interpolate";
import { generator } from "roughjs/dist/rough.es5.umd.js"

const components = [];
// Add your component proptype data here
// multiple component proptype documentation supported

const pieArcGenerator = (oldProps, newProps) => {
  const innerRadiusInterpolator = interpolateNumber(
    oldProps.innerRadius,
    newProps.innerRadius
  );
  const outerRadiusInterpolator = interpolateNumber(
    oldProps.outerRadius,
    newProps.outerRadius
  );
  const startAngleInterpolator = interpolateNumber(
    oldProps.startAngle,
    newProps.startAngle
  );
  const endAngleInterpolator = interpolateNumber(
    oldProps.endAngle,
    newProps.endAngle
  );

  return t => {
    const sliceGenerator = arc()
      .innerRadius(innerRadiusInterpolator(t))
      .outerRadius(outerRadiusInterpolator(t));
    return sliceGenerator({
      startAngle: startAngleInterpolator(t),
      endAngle: endAngleInterpolator(t)
    });
  };
};

components.push({
  name: "Mark",
  proptypes: `
    {
    markType: PropTypes.string.isRequired,
    forceUpdate: PropTypes.bool,
    renderMode: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func
        ]),
    draggable: PropTypes.bool,
    dropFunction: PropTypes.func,
    resetAfter: PropTypes.bool,
    freezeX: PropTypes.bool,
    freezeY: PropTypes.bool,
    context: PropTypes.object,
    updateContext: PropTypes.func,
    className: PropTypes.string,
    transitionDuration: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.object
        ])
    }
  `
});

const dOptions = [
  "M1.1499952083394147,229.99712500598957A230,230,0,0,1,-161.20529961992457,164.05136809685658Q0,0,-229.99928125037434,0.5749994010419719A230,230,0,0,1,-163.64784260735385,-161.6149238466508Q0,0,1.1499952083394147,229.99712500598957Z",
  "M229.9935312803222,-1.7249838281704977A230,230,0,0,1,164.4538682658427,160.79466786060058Q0,0,-162.83772576132282,162.43113946802265A230,230,0,0,1,-229.99928125037434,0.5749994010419719Q0,0,229.9935312803222,-1.7249838281704977Z"
];

export default class MarkDocs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      source: undefined,
      target: undefined,
      transitionColor: "#00a2ce",
      di: 0,
      x: 0,
      y: 0,
      customTween: {
        fn: pieArcGenerator,
        props: {
          startAngle: 0,
          endAngle: 0.5,
          innerRadius: 0,
          outerRadius: 50
        }
      },
      customTween2: {
        fn: pieArcGenerator,
        props: {
          startAngle: 0.5,
          endAngle: 1,
          innerRadius: 0,
          outerRadius: 50
        }
      }
    };
    this.dropMe = this.dropMe.bind(this);
  }

  dropMe(source, target) {
    this.setState({ source: source.nid, target: target.nid });
  }

  render() {
    const mark = (
      <Mark
        markType="rect"
        width={100}
        height={100}
        x={25}
        y={25}
        draggable={true}
        style={{ fill: "#00a2ce", stroke: "blue", strokeWidth: "1px" }}
        aria-label="Hey a rectangle"
      />
    );

    const circleMark = (
      <Mark
        markType="circle"
        renderMode="forcePath"
        r={50}
        cx={205}
        cy={255}
        style={{ fill: "#00a2ce", stroke: "blue", strokeWidth: "1px" }}
      />
    );

    const resetMark = (
      <Mark
        markType="rect"
        width={100}
        height={100}
        x={25}
        y={135}
        draggable={true}
        resetAfter={true}
        style={{ fill: "#4d430c" }}
      />
    );

    const verticalBarMark = (
      <Mark
        markType="verticalbar"
        width={50}
        height={100}
        x={185}
        y={150}
        style={{ fill: "#b3331d" }}
      />
    );

    const horizontalBarMark = (
      <Mark
        markType="horizontalbar"
        width={50}
        height={100}
        x={185}
        y={150}
        style={{ fill: "#b6a756" }}
      />
    );

    const sketchyMark = (
      <Mark
        markType="rect"
        renderMode="sketchy"
        sketchyGenerator={generator}
        width={100}
        height={100}
        x={25}
        y={250}
        style={{ fill: "#b86117", stroke: "#b86117", strokeWidth: "4px" }}
      />
    );

    const buttons = [];

    const examples = [];
    examples.push(
      {
        name: "Basic",
        demo: (
          <svg height="365" width="500">
            {mark}
            {circleMark}
            {resetMark}
            {sketchyMark}
            {horizontalBarMark}
            {verticalBarMark}
          </svg>
        ),
        source: `
      `
      },
      {
        name: "Sketchy",
        demo: (
          <div>
            <svg height="365" width="500">
              <Mark
                markType="rect"
                renderMode={{
                  renderMode: "sketchy",
                  fillStyle: "solid"
                }}
                sketchyGenerator={generator}
                width={100}
                height={100}
                x={25}
                y={50}
                style={{
                  fill: "gold",
                  stroke: "black",
                  strokeWidth: "1px",
                  fillOpacity: 0.5,
                  strokeOpacity: 0.2
                }}
              />
              <Mark
                markType="rect"
                renderMode={{
                  renderMode: "sketchy",
                  roughness: 3
                }}
                sketchyGenerator={generator}
                width={100}
                height={100}
                x={150}
                y={50}
                style={{
                  fill: "gold",
                  stroke: "black",
                  strokeWidth: "1px"
                }}
              />
              <Mark
                markType="rect"
                renderMode={{
                  renderMode: "sketchy",
                  roughness: 5,
                  bowing: 2,
                  fillWeight: 4
                }}
                sketchyGenerator={generator}
                width={100}
                height={100}
                x={25}
                y={180}
                style={{
                  fill: "#b86117",
                  stroke: "black",
                  strokeWidth: "4px"
                }}
              />{" "}
              <Mark
                markType="rect"
                renderMode={{
                  renderMode: "sketchy",
                  fillWeight: 4,
                  hachureGap: 5
                }}
                sketchyGenerator={generator}
                width={100}
                height={100}
                x={150}
                y={180}
                style={{
                  fill: "#b86117",
                  stroke: "black",
                  strokeWidth: "4px",
                  fillOpacity: 0.9,
                  strokeOpacity: 0.5
                }}
              />
            </svg>
          </div>
        ),
        source: ``
      },
      {
        name: "Transitions",
        demo: (
          <div>
            <p>
              Click to see how different Mark components with different
              transitionDuration values will change the speed with which the
              colors transition.
            </p>
            <button
              onClick={() => {
                this.setState({
                  width: 50 + Math.random() * 50,
                  height: 50 + Math.random() * 50,
                  x: Math.random() * 10,
                  y: Math.random() * 10,
                  di: (this.state.di + 1) % 2,
                  transitionColor: `rgb(${parseInt(
                    Math.random() * 255
                  )},${parseInt(Math.random() * 255)},${parseInt(
                    Math.random() * 255
                  )})`,
                  transitionColor2: `rgb(${parseInt(
                    Math.random() * 255
                  )},${parseInt(Math.random() * 255)},${parseInt(
                    Math.random() * 255
                  )})`
                });
              }}
              style={{ color: "black" }}
            >
              Change Styles
            </button>
            <svg height="365" width="600">
              <Mark
                markType="rect"
                width={this.state.width || 100}
                height={this.state.height || 100}
                style={{
                  fill: this.state.transitionColor,
                  stroke: this.state.transitionColor2,
                  strokeWidth: 5
                }}
                x={25 + this.state.x}
                y={25 + this.state.y}
              />
              <Mark
                markType="rect"
                width={this.state.width || 100}
                height={this.state.height || 100}
                transitionDuration={300}
                style={{
                  fill: this.state.transitionColor,
                  stroke: this.state.transitionColor2,
                  strokeWidth: 5
                }}
                x={145 + this.state.x}
                y={25 + this.state.y}
              />
              <Mark
                markType="rect"
                width={this.state.width || 100}
                height={this.state.height || 100}
                transitionDuration={{ fill: 2000 }}
                style={{
                  fill: this.state.transitionColor,
                  stroke: this.state.transitionColor2,
                  strokeWidth: 5
                }}
                x={25 + this.state.x}
                y={145 + this.state.y}
              />
              <Mark
                markType="rect"
                width={this.state.width || 100}
                height={this.state.height || 100}
                transitionDuration={{ default: 5000, stroke: 500 }}
                style={{
                  fill: this.state.transitionColor,
                  stroke: this.state.transitionColor2,
                  strokeWidth: 5
                }}
                x={145 + this.state.x}
                y={145 + this.state.y}
              />
              <Mark
                markType="path"
                d={dOptions[this.state.di]}
                transitionDuration={{ d: 5000, stroke: 500 }}
                style={{
                  fill: this.state.transitionColor2,
                  stroke: this.state.transitionColor,
                  strokeWidth: this.state.di + 1
                }}
                transform="translate(400,100)"
              />
            </svg>
          </div>
        ),
        source: `
      `
      },
      {
        name: "Transition Circles",
        demo: (
          <div>
            <button
              onClick={() => {
                this.setState({
                  x: Math.random() * 100,
                  y: Math.random() * 100
                });
              }}
              style={{ color: "black" }}
            >
              Change Position
            </button>
            <svg height="365" width="600">
              <Mark
                markType="circle"
                r={50}
                style={{
                  fill: "red",
                  stroke: "purple",
                  strokeWidth: 5
                }}
                transform={`translate(${75 + this.state.x},${75 + this.state.y})`}
                renderMode="sketchy"
                sketchyGenerator={generator}
              />
            </svg>
          </div>
        ),
        source: `
      `
      },
      {
        name: "Custom Tween",
        demo: (
          <div>
            <p>Not simple</p>
            <button
              onClick={() => {
                this.setState({
                  customTween: {
                    fn: pieArcGenerator,
                    props: {
                      startAngle: 0,
                      endAngle: 1,
                      innerRadius: 0,
                      outerRadius: 50
                    }
                  },
                  customTween2: {
                    fn: pieArcGenerator,
                    props: {
                      startAngle: 1,
                      endAngle: 2,
                      innerRadius: 0,
                      outerRadius: 50
                    }
                  }
                });
              }}
              style={{ color: "black" }}
            >
              Change Styles
            </button>
            <svg height="365" width="600">
              <Mark
                markType="path"
                d={pieArcGenerator(
                  this.state.customTween.props,
                  this.state.customTween.props
                )(1)}
                customTween={this.state.customTween}
                transitionDuration={{ d: 2000, stroke: 500 }}
                style={{
                  fill: this.state.transitionColor,
                  stroke: "black",
                  strokeWidth: 2
                }}
                transform="translate(200,200)"
              />
              <Mark
                markType="path"
                d={pieArcGenerator(
                  this.state.customTween2.props,
                  this.state.customTween2.props
                )(1)}
                customTween={this.state.customTween2}
                transitionDuration={{ d: 2000, stroke: 500 }}
                style={{
                  fill: this.state.transitionColor,
                  stroke: "black",
                  strokeWidth: 2
                }}
                transform="translate(200,200)"
              />
            </svg>
          </div>
        ),
        source: ``
      }
    );

    return (
      <DocumentComponent
        name="Mark"
        api="https://github.com/emeeks/semiotic/wiki/Mark"
        components={components}
        examples={examples}
        buttons={buttons}
      >
        <p>
          Mark allows you to declare different SVG elements and render them
          differently based on the attributes of the Mark.
        </p>

        <p>
          Mark automatically interpolates using D3 transitions across a
          whitelisted set of attributes and styles.
        </p>
      </DocumentComponent>
    );
  }
}

MarkDocs.title = "Mark";
