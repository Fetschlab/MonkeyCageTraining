import React from 'react';
import Shape from './Shape';

class Rectangle extends Shape {

  render() {
    let rectangle = <rect
      x={this.props.x}
      y={this.props.y}
      width={this.props.width}
      height={this.props.height}
      stroke={this.props.color}
      fill={this.props.color}
      onClick={this.props.onClick}
    />
    return (<Shape
      shape={rectangle}
      isHidden={this.props.isHidden}
      startTime={this.props.startTime}
      endTime={this.props.endTime}
    />);
  }
}

export default Rectangle;
