import React from "react";
import { PrismCode } from "react-prism";
import Button from "material-ui/Button";

const Home = ({ match }) => {
  // const documentation = <Documentation
  //   selected={match && match.params.component}
  // />
  return (
    <div>
      <div className="row">
        <div className="col-xs-8 col-xs-offset-2">
          <header className="box-row center nav-buttons">
            <h1 className="accent-font">semiotic-mark</h1>
            <p>
              <a href="https://github.com/emeeks/semiotic-mark">
                Semiotic-Mark
              </a>{" "}
              is an API for complex graphical marks for data visualization
            </p>
            <Button
              color="primary"
              raised
              onTouchTap={() =>
                window.open(`https://github.com/emeeks/semiotic-mark`)}
            >
              Github Repo
            </Button>
            <Button
              color="primary"
              raised
              onTouchTap={() =>
                window.open(
                  `https://github.com/emeeks/semiotic-mark/wiki/API-Reference`
                )}
            >
              API Docs
            </Button>
          </header>
        </div>
      </div>
      <div className="row">
        <div className="col-xs-8 col-xs-offset-2">
          <p>
            Semiotic-Mark is an API for graphical elements in data visualization
            allowing simple sketchy rendering and animation.
          </p>
          <h2>Getting Started</h2>
          <hr />
          <p>Install and save the component to your project.</p>
          <pre>
            <PrismCode className="language-bash">
              npm i -SE semiotic-mark
            </PrismCode>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Home;
