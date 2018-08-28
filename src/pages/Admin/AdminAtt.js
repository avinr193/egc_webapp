import React from 'react'
import { connect } from 'react-redux'
import firebase from '../../firebase'
import { addLiveEvent, removeLiveEvent }  from '../../firebase'

import {List, ListItem} from 'material-ui/List';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

import { setEvent, fetchAttendanceThunk, setEventDate, fetchEventsThunk, fetchEventDatesThunk, checkEventLive } from '../../store/actions'

const Admin = ({ events, attendance, currentEvent, onChangeEvent, onChangeDate, eventDate, eventDates,
                 currentDate, currentOrg, onChangeAtt, onSetEventLive, isEventLive }) => (
	<div className = "admin">
		<AdminWindow events={events} attendance={attendance} onChangeEvent={onChangeEvent}
    currentEvent={currentEvent} eventDate={eventDate} eventDates={eventDates}
    onChangeDate={onChangeDate} currentDate={currentDate} currentOrg={currentOrg}
    onChangeAtt={onChangeAtt} onSetEventLive={onSetEventLive} isEventLive={isEventLive}/>
  </div>
);

class AdminWindow extends React.Component {
	constructor(props){
    super(props);
    this.state = {
      enabled: false,
      user: null,
      attSwitchVal: "opening"
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

changeEvent(event, index, value){
  if(value){
    this.props.onChangeEvent(value, this.state.attSwitchVal);
  }
  this.setState({
    attSwitchVal: "opening"
  })
}

changeDate(event, index, value){
  if(value){
    let newVal = this.props.eventDates[value];
    this.setState({
      attSwitchVal: "opening"
    })
    this.props.onChangeDate(newVal, this.state.attSwitchVal);
  }
}

changeAttType(event, value){
  if(value){
    this.setState({
      attSwitchVal: value
    })
    this.props.onChangeAtt(value, this.state.attSwitchVal)
  }
}

download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

  downloadReport(){
    var jsonArr = [];
    var dataArr = this.props.attendance;
    console.log(dataArr)
    for (var key in dataArr){
      const attObj = {
        NAME: (dataArr[key]).name.toUpperCase(),
        EMAIL: (dataArr[key]).email,
        TIME_SUCCESS: (dataArr[key]).time
      }
      jsonArr.push(attObj);
    }
    const Json2csvParser = require('json2csv').Parser;
    const fields = ['NAME', 'EMAIL', 'TIME_SUCCESS'];
    const json2csvParser = new Json2csvParser({ fields });
    const csv = json2csvParser.parse(jsonArr);
    this.download("test.csv", csv);
  }

  addRemoveLive(e, isInputChecked){
    var liveEvent = {
      'event':this.props.currentEvent,
      'organization':this.props.currentOrg,
      'date':this.props.currentDate,
      'attPath':this.state.attSwitchVal
    }
    if(isInputChecked){
      addLiveEvent(liveEvent)
    }
    else{
      removeLiveEvent(liveEvent)
    }
    this.props.onSetEventLive(this.state.attSwitchVal);
  }

  render() {
  	var namesList = [];
    for(var i = 0; i < this.props.attendance.length; i++){
        namesList.push(<ListItem key={i} primaryText={(this.props.attendance[i]).name} secondaryText={"Time Logged: " + (this.props.attendance[i]).time}></ListItem>);
    }

    var eventsList = [];
    for(var j = 0; j < this.props.events.length; j++){
        eventsList.push(<MenuItem key={j} value={this.props.events[j]} primaryText={this.props.events[j]}></MenuItem>);
    }

    var datesList = [];
    for(var k = 0; k < this.props.eventDates.length; k++){
        datesList.push(<MenuItem key={k} value={this.props.eventDates[k].key} primaryText={this.props.eventDates[k].key}></MenuItem>);
    }

    return (
      (!this.state.enabled ?
        <div>
         	<p>Please sign-in with an admin-enabled account!</p>
          	<p style = {{color:"#DAA520"}}>If sign-in button doesn't work, make sure pop-ups are enabled and try again</p>
          	<p style = {{color:"#DAA520"}}>(wait a few seconds after returning from sign-in page for this screen to refresh)</p>
        </div> 
        : 
        <div>
          <div>Attendance:</div>
          <p></p>
          <div>Choose event & date below:</div>
          <div style={{"display":"flex","justifyContent":"center"}}>
            <div>
            <DropDownMenu maxHeight={300} value={this.props.currentEvent} onChange={this.changeEvent.bind(this)}>
        		  {eventsList}
      		  </DropDownMenu>
            </div>
            <div>
            <DropDownMenu maxHeight={300} value={this.props.eventDate.key} onChange={this.changeDate.bind(this)}>
        		  {datesList}
      		  </DropDownMenu>
            </div>
            {(this.props.eventDate.key === this.props.currentDate) ? 
            <div style={{"display":"flex"}}>
            <div style={{"marginTop":"19px"}}>Live:</div>
            <div style={{"marginTop":"17px"}}><Toggle toggled={this.props.isEventLive === true ? this.props.isEventLive : false} onToggle={(e, isInputChecked) => this.addRemoveLive(e, isInputChecked)}></Toggle></div>
            </div> : null}
          </div>
          { (this.props.eventDate.props) ? 
          (this.props.eventDate.props.closingAtt) ? 
          <div>
             <RadioButtonGroup name="whichAtt" defaultSelected="opening" onChange={this.changeAttType.bind(this)}
             style={{"maxWidth":"125px","marginLeft":"42%"}}>
                <RadioButton
                  value="opening"
                  label="opening"
                  style={{"marginBottom":"16px"}}
                />
                <RadioButton
                  value="closing"
                  label="closing"
                  style={{"marginBottom":"16px"}}
                />
             </RadioButtonGroup>
          </div> : null : <div>error checking if closing attendance.</div>
          }
          <p></p>
          <FlatButton onClick={() => this.downloadReport()} labelStyle={{color:"#FFFFFF"}} label="Download Report" 
          backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336"/>
          <List>
          	{namesList}
          </List>
        </div>
      )
    )
  }
}

const mapState = (state) => ({
    events: state.events,
    attendance: state.attendance,
    currentEvent: state.currentEvent,
    currentDate: state.currentDate,
    eventDate: state.eventDate,
    eventDates: state.eventDates,
    currentOrg: state.currentOrg,
    isEventLive: state.isEventLive
})
 const mapDispatch = (dispatch) => {
  dispatch(fetchEventsThunk());
   return {
    onChangeEvent(newEvent,attPath){
      dispatch(setEvent(newEvent));
      dispatch(fetchEventDatesThunk(attPath));
    }, 
    onChangeDate(newEventDate, attPath){
      dispatch(setEventDate(newEventDate));
      dispatch(fetchAttendanceThunk(attPath));
    },
    onChangeAtt(newAttPath){
      dispatch(fetchAttendanceThunk(newAttPath));
    },
    onSetEventLive(attPath){
      dispatch(checkEventLive(attPath))
    }
  }
 }
 export default connect(mapState, mapDispatch)(Admin);