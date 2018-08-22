import React from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import firebase from '../../firebase'
import { addEvent } from '../../firebase'

import FlatButton from 'material-ui/FlatButton';
import {List, ListItem} from 'material-ui/List';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';

import { setOrg, fetchEventsThunk } from '../../store/actions'

const Admin = ({ events, orgs, currentOrg, onChangeOrg }) => (
	<div className = "admin">
		<AdminEvntWindow events={events} orgs={orgs} currentOrg={currentOrg} onChangeOrg={onChangeOrg}/>
    </div>
);

class AdminEvntWindow extends React.Component {
	constructor(props){
    super(props);
    this.state = {
      enabled: false,
			user: null,
			event_name: '',
			event_date: {},
			event_time_start: {},
			event_time_end: {}
		}
		
		this.handleEvent = this.handleEvent.bind(this);
		this.trySubmit = this.trySubmit.bind(this);
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          enabled: true,
					user: user,
					current_org: this.props.orgs[0]
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

	handleEvent (e) {
    this.setState({ [e.target.name]: e.target.value });
	}

	changeOrg = (event, index, value) => {
		if(value){this.props.onChangeOrg(value);}
	}	
	setTimeStart = (e, time_start) => {this.setState({'event_time_start':time_start})}
	setTimeEnd = (e, time_end) => {this.setState({'event_time_end':time_end})}
	setDate = (e, date) => {this.setState({'event_date':date})}

	trySubmit (e) {
		e.preventDefault();
		let name = this.state.event_name.toUpperCase();
		let date = moment(this.state.event_date).format('M-D');
		let year = moment(this.state.event_date).format('YYYY');
		let time_start = moment(this.state.event_time_start).format('hh:mm A');
		let time_end = moment(this.state.event_time_end).format('hh:mm A');
		if(!(date && year && time_start && time_end && name)){
			this.setState({'error':true,'submitted':false});
			return false;
		}
		addEvent(this.props.currentOrg, year, date, time_start, time_end, name);
		this.setState({'submitted':true,'error':false});
		return true;
	}

  render() {
		var eventsList = [];
    for(var j = 0; j < this.props.events.length; j++){
        eventsList.push(<ListItem key={j} value={this.props.events[j]} primaryText={this.props.events[j]}></ListItem>);
		}

		var orgsList = [];
    for(var i = 0; i < this.props.orgs.length; i++){
        orgsList.push(<MenuItem key={i} value={this.props.orgs[i]} primaryText={this.props.orgs[i]}></MenuItem>);
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
				<DropDownMenu maxHeight={300} value={this.props.currentOrg} onChange={this.changeOrg}>
        	{orgsList}
      	</DropDownMenu>
				<div style={{"padding":"10px"}}></div>
        <div style={{"display":"flex"}}>
					  <div style={{"flex":"1"}}> 
						<div style = {{"font-weight": "bold"}}>Add Event</div>
						<form onSubmit={this.trySubmit}>
							<div></div>
							<label>
								<TextField name="event_name" value={this.state.event_name} onChange={this.handleEvent}
								hintText="e.g. General Council" floatingLabelText="Event Name" style={{"margin-top":"0px"}}/>
  						</label>
							<TimePicker value={this.state.event_time_start} hintText="Choose Start Time (default: now)" onChange={this.setTimeStart}/>
							<TimePicker value={this.state.event_time_end} hintText="Choose End Time (default: now)" onChange={this.setTimeEnd}/>
							<DatePicker value={this.state.event_date} firstDayOfWeek={0} hintText="Choose Date (default: today)" onChange={this.setDate}/>
  						<div style={{"padding":"10px"}}></div>
							<FlatButton labelStyle={{color:"#FFFFFF"}} label="Add Event" 
							backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336" 
							type="submit" />
						</form>
						{this.state.error ? <div style={{"color":"red","padding":"10px"}}>Please fill in all fields.</div> : null}
						{this.state.submitted ? <div style={{"color":"green","padding":"10px"}}>Event added successfully!</div> : null}
						</div>
						<div style={{"flex":"1"}}> 
						<div style = {{"font-weight": "bold"}}>View Events</div>
						<List>
          	{eventsList}
         	 	</List>
							<div></div>
							</div>
        </div>
				</div>
      )
    )
  }
}

const mapState = (state) => ({
	events: state.events,
	orgs: state.organizations,
	currentOrg: state.currentOrg
})
const mapDispatch = (dispatch) => ({
	onChangeOrg(newOrg){ 
		dispatch(setOrg(newOrg)); 
		dispatch(fetchEventsThunk())}
})

export default connect(mapState, mapDispatch)(Admin);