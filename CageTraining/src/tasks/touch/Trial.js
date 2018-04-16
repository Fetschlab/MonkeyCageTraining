import React, { Component } from 'react';
import Stimulus from './Stimulus';

class TrialTouch extends Component {

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
      onFinalized={function(data) {
        self.props.onFinalized(data);
      }}
    />
  }
}

export default TrialTouch;
