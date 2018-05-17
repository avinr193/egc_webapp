import React from 'react'

import FlatButton from 'material-ui/FlatButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

var firebase = require("firebase");

const Attendance = () => (
  <div className='attendance'>
  <AttendanceWindow />
  </div>
);

export default Attendance

class AttendanceWindow extends React.Component {
	constructor(props){
    super(props);
    this.state = {
      enabled: false,
      currentEvent: "sample_EGC_Meeting",
      event_list: [],
      user: null,
      logged: false,
      att: "Pending",
      lat: null,
      long: null,
      err: ""
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

    var database = firebase.database().ref();
    var master = this;
    database.on('value', function(datasnapshot) {
      var events = [];
      for (var key in datasnapshot.toJSON()){
        const eventObj = {
          event: key
        }
        events.push(eventObj);
      }
      master.setState({
        event_list: events
      })
    });
  }

  changeEvent(event, index, value){
    this.setState({
      currentEvent: value,
      logged: false
    })
  }

  logAtt(){
    var master = this;
    this.setState({
      att: "Logging In...",
      err: "WARNING: If longer than 10 seconds, please make sure location is allowed and try again"
    })
    var egc_meeting_lat = 40.522529
    var egc_meeting_long = -74.457966
    var userLat;
    var userLong;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
      if(position.coords){
        userLat = position.coords.latitude;
        userLong = position.coords.longitude;
        if(!Math.abs(egc_meeting_lat - userLat) < .0009 && !Math.abs(egc_meeting_long - userLong) < .0009){
          master.loginSuccess(userLat,userLong);
        }
        else{
          master.loginFailure(0);
        }
      }
      });
    } else {
      master.loginFailure(1);
    }
  }

  loginSuccess(userLat, userLong){
    var database = firebase.database().ref();
    var today = new Date();
    var timestamp = today.getHours().toString() + ":" +  today.getMinutes().toString();
    database.child(this.state.currentEvent).child("attendance").child(this.state.user.displayName.toUpperCase()).set({
    TIME_SUCCESS : timestamp,
    EMAIL : this.state.user.email
    });
    this.setState({
      logged: true,
      lat:userLat,
      long:userLong,
      att:timestamp,
      err: ""
    })
  }

  loginFailure(type){
    var error = "";
    switch(type){
      case 0:
      error = "FAIL: Please move into range of the event and try again"
      break;
        
      case 1:
      error = "FAIL: Please allow location for this page in your browser and try again"
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
    for(var j = 0; j < this.state.event_list.length; j++){
        eventsList.push(<MenuItem key={j} value={(this.state.event_list[j]).event} primaryText={(this.state.event_list[j]).event}></MenuItem>);
    }
    return (
      (!this.state.enabled ?
        <div>
          <p>Please sign-in to mark your attendance!</p>
          <p style = {{color:"#DAA520"}}>If sign-in button doesn't work, make sure pop-ups are enabled and try again</p>
          <p style = {{color:"#DAA520"}}>(wait a few seconds after returning from sign-in page for this screen to refresh)</p>
        </div> 
        : 
        <div>
        <DropDownMenu maxHeight={300} value={this.state.currentEvent} onChange={this.changeEvent.bind(this)}>
            {eventsList}
          </DropDownMenu>
          <p></p>
          <p> Signed-In: {this.state.user.displayName} </p>
          <p> Email: {this.state.user.email} </p>
          <p> Attendance Logged: {this.state.att} </p>
          <p> Longitude: {!this.state.logged ? "Pending" : this.state.long} </p>
          <p> Latitude: {!this.state.logged ? "Pending" : this.state.lat} </p>
          <div> </div>
          {(this.state.logged ? <p style={{color:'green'}}> Success! </p> :
          <FlatButton onClick={() => this.logAtt()} labelStyle={{color:"#FFFFFF"}} label="Log Attendance" 
          backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336"/>
          )}
          <p></p>
          <p style={{color:'red'}}> {this.state.err} </p>
        </div>
      )
    )
  }
}