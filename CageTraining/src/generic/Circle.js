import React, { Component } from 'react';
import Shape from './Shape';

class Circle extends Component {

  render() {
    let circle = <circle
      cx={this.props.centerx}
      cy={this.props.centery}
      r={this.props.radius}
      stroke={this.props.color}
      fill={this.props.color}
      onClick={this.props.onClick}
    />;
    return (<Shape
      shape={circle}
      isHidden={this.props.isHidden}
      startTime={this.props.startTime}
      endTime={this.props.endTime}
    />);
  }
}

export default Circle;
