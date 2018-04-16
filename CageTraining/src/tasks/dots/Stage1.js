import React, { Component } from 'react';
import Circle from '../../generic/Circle';
import Utils from '../../generic/Utils';

class Stage1 extends Component {

  constructor(props) {
    super(props);
    this.state = {
      radius: props.radius,
      isFinalized: false,
      circle: null,
    };
    this.finalize = this.finalize.bind(this);
  }

  finalize() {
    if(!this.state.isFinalized) {

      let tsTrialInitiated = Utils.getTimeStamp();

      // make circle smaller
      this.setState(prevState => ({
        radius: prevState.radius / 2,
        isFinalized: true,
      }));

      // jump to next screen after fixed time
      let self = this
      let interval = setInterval(function() {
        clearInterval(interval);
        self.props.onFinalized(self.tsStartTrial, tsTrialInitiated);
      }, this.props.waitTime)
      this.interval = interval
    }
  }

  componentWillUnmount() {
    this.interval && clearInterval(this.interval);
  }

  componentDidMount() {
    this.tsStartTrial = Utils.getTimeStamp();
  }

  render() {
    let self = this
    if(!isNaN(this.props.width) && !isNaN(this.props.height)) {
      return (
        <svg width={this.props.width} height={this.props.height}>
          <Circle
            centerx={this.props.width  / 2}
            centery={this.props.height / 2}
            radius={this.state.radius}
            color='red'
            onClick={function() {
              self.finalize();
            }}
          />
        </svg>
      );
    } else {
      return (<div></div>)
    }
  }
}

export default Stage1;
