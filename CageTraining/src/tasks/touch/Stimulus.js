import React, { Component } from 'react';
import Rectangle from '../../generic/Rectangle';
import Utils from '../../generic/Utils';

class Stimulus extends Component {

  constructor(props) {
    super(props);
    this.state = {
      width: props.width,
      height: props.height,
      color: 'red',
      isFinalized: false,
    };
    this.finalize = this.finalize.bind(this);
  }

  finalize() {
    if(!this.state.isFinalized) {
      let timestamp = Utils.getTimeStamp();
      this.setState(prevState => ({
        color: 'FireBrick',
        isFinalized: true,
      }));
      let data = {timestamp: timestamp};
      this.props.onFinalized(data);
    }
  }

  componentWillUnmount() {
    this.interval && clearInterval(this.interval);
  }

  componentDidMount() {
    this.tsStartTrial = Utils.getTimeStamp();
  }

  // if component is re-generated, this is called rather than the constructor:
  componentWillReceiveProps(props) {
    this.setState(prevState => ({
      color: 'red',
      isFinalized: false,
    }));
  }

  render() {
    let self = this
    return (
      <svg width={this.props.width} height={this.props.height}>
        <Rectangle
          x={0}
          y={0}
          width={this.state.width}
          height={this.state.height}
          color={this.state.color}
          onClick={function() {
            self.finalize();
          }}
        />
      </svg>
    );
  }
}

export default Stimulus;
