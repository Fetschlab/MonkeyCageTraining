import React, { Component } from 'react';
import Circle from '../../generic/Circle';
import Utils from '../../generic/Utils';

class Stage2 extends Component {

  constructor(props) {
    super(props);
    this.state = {
      centerx: [],
      centery: [],
      direction: props.direction,
      coherence: props.coherence,
    };
  }

  componentWillMount() {
    let centerx = []
    let centery = []
    let coherence = []
    var screenCenterX = 0.5 * this.props.width
    var screenCenterY = 0.5 * this.props.height
    var apertureRad = 0.3 * this.props.width // 0.2 by default
    for(var point = 0; point < 2 * this.props.numpoints; point++) {
      // HK - for a set of points, the centers are generated
      // random # compared to coherence to determine if noise or coherent
      centerx[point] = (Math.random() * apertureRad) + screenCenterX - (apertureRad / 2);
      centery[point] = (Math.random() * apertureRad) + screenCenterY - (apertureRad / 2);
      coherence[point] = Math.random() < this.state.coherence ? 1 : 0;
    }
    this.setState(prevState => ({
      centerx: centerx,
      centery: centery,
      coherence: coherence,
    }));
  }

  componentDidMount() {
    this.tsDotOnset = Utils.getTimeStamp();
  }

  componentWillUnmount() {
    this.interval && clearInterval(this.interval);
  }

  render() {
    // generates moving dots
    let circles = []
    let x = 0
    let y = 0
    let distance = 0
    let color = []

    for (var frame = 0; frame < this.props.numframes; frame++) {
        var startpoint = (frame % 2 === 0) ? 0 : this.props.numpoints
        for (var point = startpoint; point < startpoint + this.props.numpoints; point++) {
            // HK - moves all coherent dots from line 29
            if (this.state.coherence[point] === 1) {
                color = 'white'
                if (this.state.direction > 0) { // left
                    x = (this.state.centerx[point] + frame * this.props.jump)
                    let pos = x
                    if (pos < (0.5 * this.props.width - 0.15 * this.props.width)) {
                        let newPosition = pos + (0.3 * this.props.width)
                        x = newPosition
                    }
                } else { // right
                    x = (this.state.centerx[point] + frame * this.props.jump)
                    let pos = x
                    if (pos > (0.5 * this.props.width + 0.15 * this.props.width)) {
                        let newPosition = pos - (0.3 * this.props.width)
                        x = newPosition
                    }
                }
            } else {
                // HK - moves all non-coherent dots, randomly replotting every tick
                color = 'white'
                x = Utils.getRandomInt((0.35 * this.props.width), (0.65 * this.props.width))
                y = Utils.getRandomInt((0.35 * this.props.height), (0.65 * this.props.height))
            }

            // HK - if a color is outside of circle radius, will not be shown
            // i.e. color set to black on black background
            distance = Math.hypot((x - (this.props.width*0.5)),(y - (this.props.height*0.5)))
            if (Math.abs(distance) > (0.14 * this.props.width)) { // 0.14 as opposed to 0.15 to smooth circle
              color = 'black'
            }

        // HK - array method to move dots by locations defined above
        circles.push(<Circle
          key={2 * frame * this.props.numpoints + point}  // unique key
          centerx={x}
          centery={this.state.centery[point]}
          radius='2'
          color={color}
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
