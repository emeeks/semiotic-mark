import React from "react";
import Introduction from "./Introduction";

import MarkDocs from "./components/MarkDocs";

import { withStyles } from "material-ui/styles";
import Divider from "material-ui/Divider";
import ChevronLeftIcon from "material-ui-icons/ChevronLeft";

import classNames from "classnames";

import Drawer from "material-ui/Drawer";
import AppBar from "material-ui/AppBar";
import List, { ListItem, ListItemIcon, ListItemText } from "material-ui/List";
import MenuIcon from "material-ui-icons/Menu";
import { Link } from "react-router-dom";
import Toolbar from "material-ui/Toolbar";
import Typography from "material-ui/Typography";
import IconButton from "material-ui/IconButton";

const components = {
  mark: { docs: MarkDocs }
};

const drawerWidth = 240;

const styles = theme => ({
  root: {
    width: "100%",
    height: "100%",
    marginTop: 0,
    zIndex: 1,
    overflow: "hidden"
  },
  appFrame: {
    position: "relative",
    display: "flex",
    width: "100%",
    height: "100%"
  },
  appBar: {
    position: "absolute",
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20
  },
  hide: {
    display: "none"
  },
  drawerPaper: {
    position: "relative",
    height: "100%",
    width: drawerWidth
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar
  },
  content: {
    width: "100%",
    marginLeft: -drawerWidth,
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    height: "calc(100% - 56px)",
    marginTop: 56,
    [theme.breakpoints.up("sm")]: {
      content: {
        height: "calc(100% - 64px)",
        marginTop: 64
      }
    }
  },
  contentShift: {
    marginLeft: 0,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  }
});

class Documentation extends React.Component {
  state = {
    open: false
  };

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { match, history, classes = {}, theme = {} } = this.props;
    const selected = match && match.params.component;
    const selectedComponent = components[selected];

    let selectedDoc, Doc;
    const selectedStyles = {
      borderTop: "5px double #ac9739",
      borderBottom: "5px double #ac9739"
    };

    const allDocs = [
      <Link to={"/"} key="home-link">
        <ListItem style={{ width: "200px" }} button>
          <ListItemText primary="Home" />
        </ListItem>
      </Link>
    ];
    Object.keys(components).forEach(c => {
      const cTitle = components[c].docs.title;
      const cIcon = components[c].docs.icon;

      if (
        !components[c].parent ||
        components[c].parent === selected ||
        (selectedComponent &&
          components[c].parent === selectedComponent.parent) ||
        c === selected
      ) {
        let styleOver = {};
        if (components[c].parent) {
          styleOver = { paddingLeft: "20px" };
        }
        const finalStyle =
          selected === c
            ? {
              borderTop: "5px double #ac9739",
              borderBottom: "5px double #ac9739",
              fontWeight: 900,
              ...styleOver
            }
            : styleOver;
        allDocs.push(
          <Link to={`/${c}`} key={`${c}-link`}>
            <ListItem key={cTitle} style={finalStyle}>
              {cIcon ? <ListItemIcon>{cIcon}</ListItemIcon> : null}
              <ListItemText primary={cTitle} />
            </ListItem>
          </Link>
        );
      }
    });

    if (components[selected]) {
      Doc = selectedComponent.docs;
      selectedDoc = (
        <div className="row">
          <div className="col-xs-8 col-xs-offset-2">
            <Doc />
          </div>
        </div>
      );
    }

    const { AdditionalContent } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <AppBar
            className={classNames(
              classes.appBar,
              this.state.open && classes.appBarShift
            )}
          >
            <Toolbar
              disableGutters={!this.state.open}
              className="semiotic-header"
            >
              <IconButton
                color="contrast"
                aria-label="open drawer"
                onClick={this.handleDrawerOpen}
                className={classNames(
                  classes.menuButton,
                  this.state.open && classes.hide
                )}
              >
                <MenuIcon style={{ cursor: "pointer", color: "white" }} />
              </IconButton>
              <Typography type="title" color="inherit">
                <span
                  style={{ cursor: "pointer", color: "white" }}
                  onClick={() =>
                    this.props.history ? this.props.history.push("/") : null
                  }
                >
                  Semiotic
                </span>
                <img
                  style={{ paddingTop: "10px", width: "40px", height: "40px" }}
                  src="/semiotic/semiotic_white.png"
                />
              </Typography>
            </Toolbar>
          </AppBar>
          <Drawer
            type="persistent"
            classes={{
              paper: classes.drawerPaper
            }}
            open={this.state.open}
          >
            <div className={classes.drawerInner}>
              <div className={"drawer-title"}>
                <IconButton onClick={this.handleDrawerClose}>
                  <ChevronLeftIcon />
                </IconButton>Semiotic
              </div>
              <Divider />
              <List className={classes.list}>{allDocs}</List>
            </div>
          </Drawer>
          <main
            className={classNames(
              classes.content,
              this.state.open && classes.contentShift
            )}
          >
            {AdditionalContent ? <AdditionalContent /> : null}
            {!selectedDoc ? (
              <div className="row">
                <div className="col-xs-8 col-xs-offset-2">{Introduction}</div>
              </div>
            ) : null}
            {selectedDoc}
          </main>
        </div>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Documentation);
