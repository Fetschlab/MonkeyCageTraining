import React, { Component } from 'react';

class Shape extends Component {

  constructor(props) {
    super(props);
    let isHidden = props.isHidden
    if(isHidden === undefined) {
      isHidden = (props.startTime !== undefined && props.startTime > 0);
    }
    this.state = {
      isHidden: isHidden,
    };
    this.toggle = this.toggle.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  toggle() {
    if(this.state.isHidden) {
      this.show();
    } else {
      this.hide();
    }
  }

  show() {
    this.setState(prevState => ({
      isHidden: false
    }));
  }

  hide() {
    this.setState(prevState => ({
      isHidden: true
    }));
  }

  componentDidMount() {
    let self = this
    if(this.props.startTime) {
      let startinterval = setInterval(function() {
        self.show();
        clearInterval(startinterval);
      }, this.props.startTime);
      this.startinterval = startinterval
    }
    if(this.props.endTime) {
      let endinterval = setInterval(function() {
        self.hide();
        clearInterval(endinterval);
      }, this.props.endTime);
      this.endinterval = endinterval
    }
  }

  componentWillUnmount() {
    this.startinterval && clearInterval(this.startinterval);
    this.endinterval   && clearInterval(this.endinterval);
  }

  render() {
    if(this.state.isHidden || this.props.shape === undefined) {
      return (
        <div>
        </div>
      );
    } else {
      return (this.props.shape);
    }
  }
}

export default Shape;
