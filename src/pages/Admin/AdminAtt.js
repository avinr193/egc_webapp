import React from 'react'
import { connect } from 'react-redux'
import 'firebase/auth'
import firebase, { addLiveEvent, removeLiveEvent, signIn, isGeneralAdmin } from '../../firebase'

import { List, ListItem } from 'material-ui/List';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import Toggle from 'material-ui/Toggle';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import AllInclusive from 'material-ui/svg-icons/places/all-inclusive';
import Slider from 'material-ui/Slider'
import styled from 'styled-components';

import { setEvent, fetchAttendanceThunk, setEventDate, fetchEventDatesThunk, checkEventLive, 
  setAttPath, setIsAdminThunk, fetchLiveEventsThunk, setOrg, fetchEventsThunk, fetchYear, 
  offWatchAttendanceAdded, offWatchPollAdded, watchAttendanceAdded, watchPollAdded, fetchYearsThunk } from '../../store/actions'

const Container = styled.div`
 justify-content: center;
 display: flex;
 margin-right: 10px;
 margin-top: 10px;
`;

const Admin = ({ events, attendance, currentEvent, onChangeOrg, onChangeEvent, onChangeDate, eventDate, eventDates,
  currentDate, currentOrg, onChangeAtt, onSetEventLive, isEventLive, onSetAttPath, attPath, onIsAdmin, 
  isAdmin, currentLiveEvent, onLiveEventUpdate, orgs, years, onChangeYear, currentYear }) => (
    <div className="admin">
      <AdminWindow events={events} attendance={attendance} onChangeEvent={onChangeEvent}
        currentEvent={currentEvent} eventDate={eventDate} eventDates={eventDates}
        onChangeDate={onChangeDate} currentDate={currentDate} currentOrg={currentOrg} onChangeOrg={onChangeOrg}
        onChangeAtt={onChangeAtt} onSetEventLive={onSetEventLive} isEventLive={isEventLive}
        onSetAttPath={onSetAttPath} attPath={attPath} onIsAdmin={onIsAdmin} isAdmin={isAdmin} 
        currentLiveEvent={currentLiveEvent} onLiveEventUpdate={onLiveEventUpdate} orgs={orgs} 
        years={years} onChangeYear={onChangeYear} currentYear={currentYear}/>
    </div>
  );

class AdminWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enabled: false,
      user: null,
      oldRange: 0
    }
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          enabled: true,
          user: user
        })
        if(!this.props.isAdmin){
          isGeneralAdmin(user.email).then(isGenAdmin => {
            this.props.onIsAdmin(isGenAdmin, user.email);
          })
        }
      }
      else {
        if(this.props.isAdmin){
          this.props.onIsAdmin(false);
        }
        this.setState({
          enabled: false,
          user: null
        })
      }
    });
  }

  changeEvent(event, index, value) {
    if (value) {
      this.props.onChangeEvent(value);
    }
    this.props.onSetAttPath("opening");
  }

  changeOrg(event, index, value) {
    if (value) {
      this.props.onChangeOrg(value);
    }
  }

  changeYear(event, index, value) {
    if (value) {
      this.props.onChangeYear(value);
    }
  }

  changeDate(event, index, value) {
    if (value) {
      let newVal = null;
      for(let i = 0; i < this.props.eventDates.length; i++){
        if(this.props.eventDates[i].key === value){
          newVal = this.props.eventDates[i];
        }
      }
      if(newVal){
        this.props.onSetAttPath("opening");
        this.props.onChangeDate(newVal);
      }
    }
  }

  changeAttType(event, value) {
    if (value) {
      this.props.onSetAttPath(value);
      this.props.onChangeAtt(value);
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

  downloadReport() {
    var jsonArr = [];
    var dataArr = this.props.attendance;
    for (var key in dataArr) {
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

  addRemoveLive(e, isInputChecked) {
    var liveEvent = {
      'event': this.props.currentEvent,
      'organization': this.props.currentOrg,
      'date': this.props.eventDate.key,
      'attPath': this.props.attPath,
      'location': {
        lat: this.props.eventDate.props.location.latitude,
        long: this.props.eventDate.props.location.longitude,
        radius: this.props.eventDate.props.location.radius,
      }
    }
    if (isInputChecked) {
      addLiveEvent(liveEvent)
    }
    else {
      removeLiveEvent(liveEvent)
    }
    this.props.onSetEventLive(this.props.attPath);
    this.props.onLiveEventUpdate();
  }

  updateLocation(e, val){
    this.setState({oldRange: this.props.currentLiveEvent.location.radius});
    let newLiveEvent = this.props.currentLiveEvent;
    newLiveEvent.location.radius = val;
    addLiveEvent(newLiveEvent);
    this.props.onLiveEventUpdate();
  }

  render() {
    let namesList = [];
    for (let i = 0; i < this.props.attendance.length; i++) {
      namesList.push(<ListItem key={i} primaryText={(this.props.attendance[i]).name} 
      secondaryText={"Time Logged: " + (this.props.attendance[i]).time + ", Distance: " + 
      (this.props.attendance[i]).location.distance.toFixed(3)}></ListItem>);
    }

    let orgsList = [];
		for (let i = 0; i < this.props.orgs.length; i++) {
			orgsList.push(<MenuItem key={i} value={this.props.orgs[i]} primaryText={this.props.orgs[i]}></MenuItem>);
		}

    let eventsList = [];
    for (let j = 0; j < this.props.events.length; j++) {
      eventsList.push(<MenuItem key={j} value={this.props.events[j]} primaryText={this.props.events[j]}></MenuItem>);
    }

    let datesList = [];
    for (let k = 0; k < this.props.eventDates.length; k++) {
      datesList.push(<MenuItem key={k} value={this.props.eventDates[k].key} primaryText={this.props.eventDates[k].key}></MenuItem>);
    }

    let yearsList = [];
    for (let k = 0; k < this.props.years.length; k++) {
      yearsList.push(<MenuItem key={k} value={this.props.years[k]} primaryText={this.props.years[k]}></MenuItem>);
    }
    let today = new Date();

    return (
      (!this.state.enabled ?
        <div>
          <FlatButton onClick={() => signIn()} labelStyle={{ color: "#FFFFFF" }} label={"SIGN-IN"}
            backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336" />
          <p style={{ color: "#DAA520", "marginTop": "10px" }}>If sign-in button doesn't work, make sure pop-ups are enabled and try again</p>
          <p style={{ color: "#DAA520" }}>(wait a few seconds after returning from sign-in page for this screen to refresh)</p>
        </div>
        :
        (this.props.isAdmin ?
          <div>
            <DropDownMenu maxHeight={300} value={this.props.currentOrg} onChange={this.changeOrg.bind(this)}>
						{orgsList}
					</DropDownMenu>
          <DropDownMenu maxHeight={300} value={this.props.currentYear} onChange={this.changeYear.bind(this)}>
            {yearsList}
          </DropDownMenu>
					<div style={{ "padding": "10px" }}></div>
            <div>Attendance:</div>
            <p></p>
            <div>Choose event & date below:</div>
            <div style={{ "display": "flex", "justifyContent": "center" }}>
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
              {((this.props.eventDate.key === this.props.currentDate &&
              this.props.currentYear === today.getFullYear().toString()) || this.props.isEventLive === true) ?
                <div style={{ "display": "flex" }}>
                  <div style={{ "marginTop": "19px" }}>Live:</div>
                  <div style={{ "marginTop": "17px" }}><Toggle toggled={this.props.isEventLive} onToggle={(e, isInputChecked) => this.addRemoveLive(e, isInputChecked)}></Toggle></div>
                </div> : null}
            </div>
            {(this.props.eventDate.props) ?
              (this.props.eventDate.props.closingAtt) ?
                <div>
                  <Container>
                    <RadioButtonGroup name="whichAtt" defaultSelected="opening" valueSelected={this.props.attPath}
                      onChange={this.changeAttType.bind(this)}
                      style={{ "maxWidth": "115px" }}>
                      <RadioButton
                        value="opening"
                        label="opening"
                        style={{ "marginBottom": "16px" }}
                      />
                      <RadioButton
                        value="closing"
                        label="closing"
                        style={{ "marginBottom": "6px" }}
                      />
                    </RadioButtonGroup>
                  </Container>
                </div> : null : this.props.onSetAttPath("opening")
            }
            {(this.props.isEventLive && this.props.currentLiveEvent) ? 
            <div>
            <div style={{"marginTop":"10px"}}>Live Event Radius: {this.props.currentLiveEvent.location.radius}m</div>
            <Container>
            <Slider defaultValue={this.props.currentLiveEvent.location.radius} value={this.props.currentLiveEvent.location.radius} 
            max={500} min={10} style={{"width":"100%","maxWidth":"250px"}}
            sliderStyle={{"marginBottom": "9px", "marginTop":"9px"}} onChange={ (e, val) => this.val = val }  
            onDragStop={ (e) => this.updateLocation(e, this.val) }></Slider>
            <div style={{"padding":"5px"}}></div>
            <IconButton style={{"width":"72","height":"72","padding":"0px"}}
              onClick={(e) => this.updateLocation(e, 5000000000)}><AllInclusive/></IconButton>
            </Container>
            </div>
            : null}
            <p></p>
            <FlatButton onClick={() => this.downloadReport()} labelStyle={{ color: "#FFFFFF" }} label="Download Report"
              backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336" />
            <List style={{"maxHeight":"400px", "overflow":"scroll"}}>
              {namesList}
            </List>
          </div> : <div>You are not an admin.</div>)
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
  isEventLive: state.isEventLive,
  attPath: state.attPath,
  isAdmin: state.isAdmin,
  currentLiveEvent: state.currentLiveEvent,
  orgs: state.organizations,
  years: state.years,
  currentYear: state.currentYear
})
const mapDispatch = (dispatch) => {
  dispatch(checkEventLive());
  return {
    onChangeOrg(newOrg) {
      dispatch(offWatchAttendanceAdded());
      dispatch(offWatchPollAdded());
      dispatch(setOrg(newOrg));
      dispatch(fetchYearsThunk());
      dispatch(fetchEventsThunk());
      dispatch(watchAttendanceAdded());
      dispatch(watchPollAdded());
    },
    onChangeYear(newYear) {
      dispatch(fetchYear(newYear));
      dispatch(fetchEventsThunk());
    },
    onChangeEvent(newEvent) {
      dispatch(setEvent(newEvent));
      dispatch(fetchEventDatesThunk());
    },
    onChangeDate(newEventDate) {
      dispatch(setEventDate(newEventDate));
      dispatch(fetchAttendanceThunk());
    },
    onChangeAtt(newAttPath) {
      dispatch(fetchAttendanceThunk(newAttPath));
    },
    onSetEventLive(attPath) {
      dispatch(checkEventLive(attPath))
    },
    onSetAttPath(attPath) {
      dispatch(setAttPath(attPath));
    },
    onIsAdmin(isGenAdmin, email){
      dispatch(setIsAdminThunk(isGenAdmin, email));
    },
    onLiveEventUpdate(){
      dispatch(fetchLiveEventsThunk());
    }
  }
}
export default connect(mapState, mapDispatch)(Admin);