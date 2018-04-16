import React, { Component } from 'react';
import Circle from '../../generic/Circle';
import Utils from '../../generic/Utils';

class Stage2 extends Component {

  constructor(props) {
    super(props);
    this.state = {
      centerx: [],
      centery: [],
    };
  }

  componentWillMount() {
    let centerx = []
    let centery = []
    var screenCenterX = 0.5 * this.props.width
    var screenCenterY = 0.5 * this.props.height
    var apertureRad = 0.4 * this.props.width
    for(var point = 0; point < 2 * this.props.numpoints; point++) {
      centerx[point] = (Math.random() * apertureRad) + screenCenterX - (apertureRad / 2);
      centery[point] = (Math.random() * apertureRad) + screenCenterY - (apertureRad / 2);
    }
    this.setState(prevState => ({
      centerx: centerx,
      centery: centery,
    }));
  }

  componentDidMount() {
    this.tsDotOnset = Utils.getTimeStamp();
  }

  componentWillUnmount() {
    this.interval && clearInterval(this.interval);
  }

  render() {

    // generate moving dots
    // note: the coherence value is available here in 'this.props.coherence', but it is not yet used
    let circles = []
    for(var frame = 0; frame < this.props.numframes; frame++) {
      var startpoint = (frame % 2 === 0) ? 0 : this.props.numpoints
      for(var point = startpoint; point < startpoint + this.props.numpoints; point++) {
        circles.push(<Circle
          key={2 * frame * this.props.numpoints + point}  // unique key
          centerx={this.state.centerx[point] + frame * this.props.jump}
          centery={this.state.centery[point]}
          radius='2'
          color='white'
          startTime={frame * this.props.frameDuration}
          endTime={(frame + 1) * this.props.frameDuration - 1}
        />)
      }
    }

    // run finalizer after we are done:
    let self = this
    let interval = setInterval(function() {
      clearInterval(interval);
      self.props.onFinalized(self.tsDotOnset);
    }, this.props.numframes * this.props.frameDuration)
    this.interval = interval

    // return SVG element:
    return (
      <svg width={this.props.width} height={this.props.height}>
        {circles}
      </svg>
    );
  }
}

export default Stage2;
