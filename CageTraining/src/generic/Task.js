import React, { Component } from 'react';
import Utils from './Utils';
import '../App.css';

// register all supported trials:
import TrialDots from '../tasks/dots/Trial'
import TrialTouch from '../tasks/touch/Trial'
import TrialTouchDot from '../tasks/touchdot/Trial'
const tasks = {
  dots: TrialDots,
  touch: TrialTouch,
  touchdot: TrialTouchDot,
}

class Task extends Component {

  constructor(props) {
    super(props);
    this.state = {
      juicer: props.juicer,
      foldername: props.foldername,
      height: props.height,
      width: props.width,
      task: props.task,
      trialnumber: 0,
    };
  }

  componentWillUnmount() {
    this.interval && clearInterval(this.interval);
  }

  render() {

    // load the correct triel:
    if (!(this.state.task in tasks)) {
      let text = 'Unknown task: ' + this.state.task;
      return (<div id="warning">{text}</div>);
    }
    let Trial = tasks[this.state.task];

    // set properties of trial:
    let self = this;
    let trialNumberString = Utils.padWithZeros(this.state.trialnumber, 5);
    let filename = this.state.foldername + '/trial' + trialNumberString + '.json';

    // show trial:
    let trial = <Trial
      height={this.state.height}
      width={this.state.width}

      // function performed when trial is completed:
      onFinalized={function(data) {

        // give juice and export trial to Dropbox:
        self.state.juicer.pump(1432);
        Utils.exportTrial(filename, data);

        // jump to next trial after fixed time:
        let interval = setInterval(function() {
          clearInterval(interval);
          self.setState(prevState => ({
            trialnumber: prevState.trialnumber + 1,
          }));
        }, 1000);
        self.interval = interval;
      }}
    />;
    return(trial);
  }
}

export default Task;
