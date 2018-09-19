import React, { Component } from 'react';
import Stimulus from './Stimulus';

class TrialTouchDot extends Component {

  constructor(props) {
    super(props);
    this.state = {
      height: props.height,
      width: props.width,
    };
  }

  // main rendering function:
  render() {
    let self = this
    return <Stimulus
      width={this.state.width}
      height={this.state.height}
      r={self.state.height * 0.2}
      minr={self.state.height * 0.15}
      onFinalized={function(data) {
        self.props.onFinalized(data);
      }}
    />
  }
}

export default TrialTouchDot;
