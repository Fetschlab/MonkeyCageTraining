import React, { Component } from 'react';
import Circle from '../../generic/Circle';
import Utils from '../../generic/Utils';

class Stage3 extends Component {

  constructor(props) {
    super(props);
    this.state = {
      centerx: [],
      centery: [],
      color: [],
      visibility: [],
      isAnswered: false,
    };
    this.answer = this.answer.bind(this);
  }

  answer(index) {
    if(!this.state.isAnswered) {

      // get a time stamp
      let tsResponse = Utils.getTimeStamp()
      // get response: 0 is left, 1 is right
      let response = (index === 0) ? 'left' : 'right';

      // change color of clicked circle:
      let color = this.state.color
      color[index] = 'FireBrick'

      // hide other circle
      let visibility = this.state.visibility
      if(index === 0) {
        visibility[1] = false
      } else if(index === 1) {
        visibility[0] = false
      }

      // update state
      this.setState(prevState => ({
        color: color,
        visibility: visibility,
        isAnswered: true,
      }));

      // execute finalizer after wait time
      let self = this
      let interval = setInterval(function() {
        clearInterval(self.interval);
        self.props.onFinalized(self.tsTargetOnset, tsResponse, response);
      }, this.props.waitTime);
      this.interval = interval
    }
  }

  componentWillMount() {
    let centerx = [(0.1 * this.props.width),  (0.9 * this.props.width)]
    let centery = [(0.5 * this.props.height), (0.5 * this.props.height)]
    let color   = ['red', 'red']
    let visibility = [true,true]
    this.setState(prevState => ({
      centerx: centerx,
      centery: centery,
      color: color,
      visibility: visibility,
    }));
  }

  componentDidMount() {
    this.tsTargetOnset = Utils.getTimeStamp();
  }

  componentWillUnmount() {
    this.interval && clearInterval(this.interval);
  }

  render() {

    // generate circles
    let self = this
    let circles = []
    for(var point = 0; point < this.state.centerx.length; point++) {
      let index = point
      circles.push(<Circle
        key={point + '_' + this.state.visibility[index]}
        centerx={this.state.centerx[point]}
        centery={this.state.centery[point]}
        radius='50'
        color={this.state.color[point]}
        isHidden={!this.state.visibility[point]}
        onClick={function() {
          self.answer(index);
        }}
      />)
    }

    // return SVG element
    return (
      <svg width={this.props.width} height={this.props.height}>
        {circles}
      </svg>
    );
  }
}

export default Stage3;
