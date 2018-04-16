import React, { Component } from 'react';
import BLE from './generic/BLE';
import Utils from './generic/Utils';
import Task from './generic/Task';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);

    // parse arguments passed via URL:
    let args = Utils.parseUrlArguments();
    if(args.monkey === undefined) {
      args.monkey = 'Unknown';
    }
    if(args.task === undefined) {
      args.task = 'touch';
    }

    // set up app state, and register functions:
    this.state = {
      connected: false,
      juicer: null,
      monkey: args.monkey,
      task: args.task,
    };
    this.connectBLE = this.connectBLE.bind(this);

    // prevent dragging on tablet:
    document.addEventListener('touchmove', function(event) {
      event.preventDefault();
    });
  }

  // connect to the juicer:
  connectBLE() {
    let juicer = new BLE();
    this.setState(prevState => ({
      juicer: juicer,
      connected: true,
    }));
  }

  // change state when window is resized:
  updateDimensions() {
    this.setState(prevState => ({
      height: window.innerHeight,
      width:  window.innerWidth,
    }));
  }

  // once app is mounted, register its size and register resize handler:
  componentDidMount() {
    this.setState(prevState => ({
      height: window.innerHeight,
      width:  window.innerWidth,
    }));
    window.addEventListener("resize", this.updateDimensions);
  }

  // render the app:
  render() {

    // show pairing button if not connected to juicer:
    if(!this.state.connected) {
      return <input
        type="button"
        onClick={this.connectBLE}
        value="Pair with Bluetooth device"
      />;

    // otherwise, show the specified task:
    } else {
      return <Task
        monkey={this.state.monkey}
        juicer={this.state.juicer}
        height={this.state.height}
        width={this.state.width}
        task={this.state.task}
        foldername={'/' + this.state.monkey + '/' + this.state.task}
      />;
    }
  }
}

export default App;
