import React from 'react';
import { connect } from 'react-redux';

import Loader from 'react-loader-spinner';

import FlatButton from 'material-ui/FlatButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

import firebase, { addAtt, isLiveEvent, signIn } from '../firebase'
import 'firebase/auth'

import { setLiveEvent, fetchAttendanceThunk, fetchLiveEventsThunk, fetchDateThunk } from '../store/actions'

const Attendance = ({ liveEvents, currentDate, onChangeEvent, currentLiveEvent, currentOrg, currentYear }) => (
  <div className='attendance'>
    <AttendanceWindow liveEvents={liveEvents} currentDate={currentDate}
      currentLiveEvent={currentLiveEvent} onChangeEvent={onChangeEvent} currentOrg={currentOrg}
      currentYear={currentYear} />
  </div>
);

class AttendanceWindow extends React.Component {
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
      enabledSubmit: false
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

  changeEvent(event, index, value) {
    if (value) {
      let newVal = JSON.parse(value);
      this.props.onChangeEvent(newVal);
    }
    this.setState({
      logged: false
    })
  }

  //from: https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
  measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d * 1000; // meters
  }

  logAtt() {
    var master = this;
    this.setState({
      att: "Logging In...",
      err: "WARNING: If longer than 10 seconds, please make sure location is allowed and try again"
    })
    let meetingLat = this.props.currentLiveEvent.location.lat;
    let meetingLong = this.props.currentLiveEvent.location.long;
    let radius = this.props.currentLiveEvent.location.radius;
    var userLat;
    var userLong;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        if (position.coords) {
          userLat = position.coords.latitude;
          userLong = position.coords.longitude;
          let distToEvent = master.measure(meetingLat, meetingLong, userLat, userLong);
          if (distToEvent <= radius) {
            master.loginSuccess(userLat, userLong, distToEvent);
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

  loginSuccess(userLat, userLong, distToEvent) {
    var today = new Date();
    var timestamp = today.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    if (!isLiveEvent(this.props.currentDate + this.props.currentLiveEvent.event + this.props.currentLiveEvent.organization, this.props.currentLiveEvent.attPath)) {
      return this.loginFailure(2);
    }
    addAtt(this.props.currentLiveEvent.organization, this.props.currentDate, this.props.currentLiveEvent.event, 
      this.state.user.displayName.toLowerCase().replace(/\b(\s\w|^\w)/g, function (txt) { return txt.toUpperCase(); }), timestamp, this.state.user.email, userLat, userLong, 
      distToEvent, this.props.currentLiveEvent.attPath, this.state.user.uid, this.props.currentYear);
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

  render() {
    var eventsList = [];
    for (var j = 0; j < this.props.liveEvents.length; j++) {
      eventsList.push(<MenuItem key={j}
        value={JSON.stringify(this.props.liveEvents[j])} primaryText={this.props.liveEvents[j].event
          + " - " + this.props.liveEvents[j].organization.match(/[A-Z]/g).join('')}></MenuItem>);
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
        (this.props.liveEvents[0] ?
          <div>
            <DropDownMenu maxHeight={300} value={JSON.stringify(this.props.currentLiveEvent)} 
            onChange={this.changeEvent.bind(this)} openImmediately={!(this.props.liveEvents.length === 1)}
            onClose={() => this.setState({enabledSubmit: true})}>
              {eventsList}
            </DropDownMenu>
            <p></p>
            {this.props.liveEvents.length === 1 || this.state.enabledSubmit === true ?
            <div>
            <p> Signed-In: {this.state.user.displayName.toLowerCase().replace(/\b(\s\w|^\w)/g, function (txt) { return txt.toUpperCase(); })} </p>
            <p> Attendance Logged: {this.state.att} </p>
            <p> Latitude: {!this.state.logged ? "Pending" : this.state.lat} </p>
            <p> Longitude: {!this.state.logged ? "Pending" : this.state.long} </p>
            <div> </div>
            {(this.state.logged ? <p style={{ color: 'green' }}> Success! </p> :
              <FlatButton onClick={() => this.logAtt()} labelStyle={{ color: "#FFFFFF" }} label="Log Attendance"
                backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336" />
            )}
            <p></p>
            {this.state.att === "Logging In..." ? <Loader type="Triangle" color="#F44336" height={80} width={80}/> : null}
            <p style={{ color: 'red' }}> {this.state.err} </p></div> : 
            <div style={{"position":"absolute", "bottom":"50px","margin-left":"auto","margin-right":"auto",
            "left":"0", "right":"0"}}>Choose an event!</div>}
          </div> 
          : <div>No live events at this time.</div>)
      )
    )
  }
}

const mapState = (state) => ({
  liveEvents: state.liveEvents,
  currentDate: state.currentDate,
  currentLiveEvent: state.currentLiveEvent,
  currentOrg: state.currentOrg,
  currentYear: state.currentYear
})

const mapDispatch = (dispatch) => {
  dispatch(fetchLiveEventsThunk());
  dispatch(fetchDateThunk());
  return {
    onChangeEvent(newLiveEvent) { dispatch(setLiveEvent(newLiveEvent)); dispatch(fetchAttendanceThunk()) }
  }
}
export default connect(mapState, mapDispatch)(Attendance);