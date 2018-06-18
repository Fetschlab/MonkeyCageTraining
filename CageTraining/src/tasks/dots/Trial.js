import React, { Component } from 'react';
import Stage1 from './Stage1';
import Stage2 from './Stage2';
import Stage3 from './Stage3';
import Utils from '../../generic/Utils';

class TrialDots extends Component {

  constructor(props) {
    super(props);
    this.state = {
      height: props.height,
      width: props.width,
      direction: props.direction,
      coherence: props.coherence,
    };
    this.generateTrial = this.generateTrial.bind(this);
    this.data = {}
  }

  // once component is ready, generate trial:
  componentDidMount() {
    this.generateTrial(this.props);
  }

  // if component is re-generated, this is called rather than the constructor:
  componentWillReceiveProps(props) {
    this.generateTrial(props);
  }

  // function that generates a new trial, and triggers render:
  generateTrial(props) {
    let direction = Utils.getTrialDirection() // HK - randomizes direction
    let coherence = Utils.getTrialCoherence() // HK - randomizes coherence
    this.setState(prevState => ({
      stage: 1,
      direction: direction,
      coherence: coherence,
      jump: ((direction > 0) ? -8 : 8), // -10, 10
      frameDuration: 20,
      timeDelayToDotOnset: Utils.getRandomIntExp(200,1000,200),
      timeDotDuration: Utils.getRandomInt(750,1000), // HK - should these be random?
      timeTimeOut: 750, // time to wait after response
    }));
  }


// summary of requested times:
//
// timeDelayToDotOnset = time from initiating trial to onset of dots
// timeDotDuration     = duration of moving dots
// timeTimeOut         = time that target remains on screen after response
//
// summary of measured time stamps (ts):
//
// tsStartTrial        = large circle is presented, waiting for touch to continue
// tsTrialInitiated    = large circle is touched, becomes small, short delay until moving dots come on
// tsDotOnset          = stimulus, moving dots come on
// tsTargetOnset       = ready for response, the left and right target come on
// tsResponse          = time of response
// goRT, in data.goRT  = the go reaction time, tsResponse minus tsTargetOnset

  render() {
    let self = this
    let page = null

    // stage 1: start of the trial
    // large circle should be touched to continue to stimulus
    switch(this.state.stage) {
      case 1:
        page = <Stage1   // StartTrial
          width={this.state.width}
          height={this.state.height}
          radius={50}
          waitTime={this.state.timeDelayToDotOnset}
          onFinalized={function(tsStartTrial, tsTrialInitiated) {
            self.data.tsStartTrial = tsStartTrial;
            self.data.tsTrialInitiated = tsTrialInitiated;
            self.setState(prevState => ({
              stage: prevState.stage + 1
            }));
          }}
        />
        break;

      // stage 2: stimulus
      // view the moving dots going to the left or right
      case 2:
        page = <Stage2  // Stimulus
          width={this.state.width}
          height={this.state.height}
          frameDuration={this.state.frameDuration} // duration of each frame, numframes*frameDuration is dot duration
          numframes={Math.ceil(this.state.timeDotDuration / this.state.frameDuration)}
          numpoints={7} // number of dots per frame
          jump={this.state.jump}
          coherence={this.state.coherence}
          direction={this.state.direction}
          onFinalized={function(tsDotOnset) {
            self.data.tsDotOnset = tsDotOnset;
            self.setState(prevState => ({
              stage: prevState.stage + 1
            }));
          }}
        />
        break;

      // stage 3: response
      // touch the left or right target, record accuracy and goRT, save data
      case 3:
        page = <Stage3  // Response
          width={this.state.width}
          height={this.state.height}
          waitTime={this.state.timeTimeOut}

          // function to execute once response is received:
          onFinalized={function(tsTargetOnset, tsResponse, response) {
            var saveArray = ['direction',
                              'coherence',
                              'timeDelayToDotOnset',
                              'timeDotDuration',
                              'timeTimeOut',
                              'frameDuration']
            for (var i = 0; i < saveArray.length; i++) {
              self.data[saveArray[i]] = self.state[saveArray[i]];
            }
            self.data.response=response;
            self.data.accuracy=(((response === 'left'  & self.state.direction === 1) |
                                 (response === 'right' & self.state.direction === -1)) ? 1 : 0);
            self.data.goRT=tsResponse - tsTargetOnset;
            self.data.tsTargetOnset=tsTargetOnset;
            self.data.tsResponse=tsResponse;
            self.data.unixTime=Utils.getUnixTime()
            self.props.onFinalized(self.data);
          }}
          />
        break;
      default:
        break;
    }
    return(page);
  }
}

export default TrialDots;
