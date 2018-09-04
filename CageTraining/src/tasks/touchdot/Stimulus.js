import React, { Component } from 'react';
import ZingTouch from 'zingtouch';
import Circle from '../../generic/Circle';
import Utils from '../../generic/Utils';

class Stimulus extends Component {

  constructor(props) {
    super(props);
    this.state = {
      width: props.width,
      height: props.height,
      r: props.r,
      color: 'red',
      isFinalized: false,
      zt: new ZingTouch.Region(document.getElementById('root')), // HK - sets up zingtouch region
    };
    this.finalize = this.finalize.bind(this);
  }

  finalize() {
    console.log(this.state.zt);
    // let touchCheck = new ZingTouch.Tap({ tolerance: 125 });
    if(!this.state.isFinalized) {
        let swipeCheck = false;
        console.log(swipeCheck + ' before swipe');
        this.state.zt.bind(document.getElementById('root'), 'swipe', function(e) {
          swipeCheck = true;
          console.log(swipeCheck + ' at swipe');
        });
        console.log(swipeCheck + ' after swipe');
        let timestamp = Utils.getTimeStamp();
        this.setState(prevState => ({
          color: 'FireBrick',
          isFinalized: true,
        }));
        let data = { timestamp: timestamp };
        if(swipeCheck === false) {
          this.props.onFinalized(data);
        }
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
      r: Math.max(prevState.r * 0.995, this.props.minr),
      color: 'red',
      isFinalized: false,
    }));
  }

  render() {
    let self = this
    return (
      <svg width={this.props.width} height={this.props.height}>
        <Circle
          centerx={this.state.width * 0.5}
          centery={this.state.height * 0.5}
          radius={this.state.r}
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
