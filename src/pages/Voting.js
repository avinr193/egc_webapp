import React from 'react'
import { connect } from 'react-redux'

import FlatButton from 'material-ui/FlatButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import styled from 'styled-components';

import firebase from '../firebase'
import { logOption, isLivePoll, signIn } from '../firebase'

import { setLivePoll, fetchLivePollsThunk } from '../store/actions'

const Container = styled.div`
 justify-content: center;
 display: flex;
`;

const Voting = ({ livePolls, onChangePoll, currentLivePoll }) => (
  <div className='attendance'>
    <VotingWindow livePolls={livePolls}
      currentLivePoll={currentLivePoll} onChangePoll={onChangePoll} />
  </div>
);

class VotingWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enabled: false,
      user: null,
      logged: false,
      att: "Pending",
      lat: null,
      long: null,
      err: "",
      currentOption: null
    }
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          enabled: true,
          user: user
        })
      }
      else {
        this.setState({
          enabled: false,
          user: null
        })
      }
    });
  }

  changePoll(event, index, value) {
    if (value) {
      let newVal = JSON.parse(value);
      this.props.onChangePoll(newVal);
    }
    this.setState({
      logged: false
    })
  }

  logAtt() {
    var master = this;
    this.setState({
      att: "Logging In...",
      err: "WARNING: If longer than 10 seconds, please make sure location is allowed and try again",
      logged: false
    })
    var egc_meeting_lat = 40.522529
    var egc_meeting_long = -74.457966
    var userLat;
    var userLong;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        if (position.coords) {
          userLat = position.coords.latitude;
          userLong = position.coords.longitude;
          if (!Math.abs(egc_meeting_lat - userLat) < .0009 && !Math.abs(egc_meeting_long - userLong) < .0009) {
            master.loginSuccess(userLat, userLong);
          }
          else {
            master.loginFailure(0);
          }
        }
      });
    } else {
      master.loginFailure(1);
    }
  }

  loginSuccess(userLat, userLong) {
    var today = new Date();
    var timestamp = today.getHours().toString() + ":" + today.getMinutes().toString();
    if (!isLivePoll(this.props.currentLivePoll.uuid)) {
      return this.loginFailure(2);
    }
    logOption(this.props.currentLivePoll, this.state.currentOption, this.state.user, timestamp, userLat, userLong);
    this.setState({
      logged: true,
      lat: userLat,
      long: userLong,
      att: timestamp,
      err: ""
    })
  }

  loginFailure(type) {
    var error = "";
    switch (type) {
      case 0:
        error = "FAIL: Please move into range of the event and try again"
        break;

      case 1:
        error = "FAIL: Please allow location for this page in your browser and try again"
        break;

      case 2:
        error = "FAIL: Event no longer live."
        break;

      default:
        error = "FAIL: Unknown Error, please refresh and try again"
        break;
    }
    this.setState({
      att: "Pending",
      err: error
    })
  }

  changeOption(event, value) {
    if (value) {
      this.setState({
        currentOption: value
      })
    }
  }

  componentDidUpdate() {
    if (this.props.currentLivePoll.options && !this.state.currentOption) {
      this.setState({
        currentOption: this.props.currentLivePoll.options[0].text
      })
    }
  }

  render() {
    let pollsList = [];
    for (let j = 0; j < this.props.livePolls.length; j++) {
      pollsList.push();
    }

    return (
      (!this.state.enabled ?
        <div>
          <FlatButton onClick={() => signIn()} labelStyle={{ color: "#FFFFFF" }} label={"SIGN-IN"}
            backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336" />
          <p style={{ color: "#DAA520", "marginTop": "10px" }}>If sign-in button doesn't work, make sure pop-ups are enabled and try again</p>
          <p style={{ color: "#DAA520" }}>(wait a few seconds after returning from sign-in page for this screen to refresh)</p>
        </div>
        :
        (this.props.livePolls[0] ?
          <div>
            <DropDownMenu maxHeight={300} value={JSON.stringify(this.props.currentLivePoll)} onChange={this.changePoll.bind(this)}>
              {this.props.livePolls.map((poll, index) => {
                return (<MenuItem key={index}
                  value={JSON.stringify(poll)} primaryText={poll.question
                    + " - " + poll.organization.match(/[A-Z]/g).join('')}></MenuItem>
                )
              })}
            </DropDownMenu>
            <p></p>
            {this.props.currentLivePoll.options ?
              <Container>
                <div>
                  <RadioButtonGroup name="whichOpt" defaultSelected={this.props.currentLivePoll.options[0].text} valueSelected={this.state.currentOption}
                    onChange={this.changeOption.bind(this)}
                    style={{ "maxWidth": "115px" }}>
                    {this.props.currentLivePoll.options.map((option, index) => {
                      return (<RadioButton key={index}
                        value={option.text}
                        label={option.text}
                        style={{ "marginBottom": "16px" }}
                      />
                      )
                    })}
                  </RadioButtonGroup>
                </div>
              </Container> : null
            }
            <div> </div>
            <FlatButton onClick={() => this.logAtt()} labelStyle={{ color: "#FFFFFF" }} label="Submit"
              backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336" />
            <p></p>
            {(this.state.logged ? <p style={{ color: 'green' }}> Success! </p> : null)}
            <p style={{ color: 'red' }}> {this.state.err} </p>
          </div>
          : <div>No live polls at this time.</div>)
      )
    )
  }
}

const mapState = (state) => ({
  livePolls: state.livePolls,
  currentLivePoll: state.currentLivePoll
})

const mapDispatch = (dispatch) => {
  dispatch(fetchLivePollsThunk());
  return {
    onChangePoll(newLivePoll) { dispatch(setLivePoll(newLivePoll)); }
  }
}
export default connect(mapState, mapDispatch)(Voting);