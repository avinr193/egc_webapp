import React from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import firebase, { addEvent, signIn, isGeneralAdmin } from '../../firebase'


import LocationPickerExample from './Map'
import FlatButton from 'material-ui/FlatButton';
import {List, ListItem} from 'material-ui/List';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox'

import { setOrg, fetchEventsThunk } from '../../store/actions'

const Admin = ({ events, orgs, currentOrg, onChangeOrg }) => (
	<div className = "admin">
		<AdminEvntWindow events={events} orgs={orgs} currentOrg={currentOrg} onChangeOrg={onChangeOrg}/>
    </div>
);

function loadJS(src) {
	var ref = window.document.getElementsByTagName("script")[0];
	var script = window.document.createElement("script");
	script.src = src;
	script.async = true;
	ref.parentNode.insertBefore(script, ref);
}

class AdminEvntWindow extends React.Component {
	constructor(props){
    super(props);
    this.state = {
      enabled: false,
			user: null,
			event_name: '',
			event_date: {},
			event_time_start: {},
			event_time_end: {},
			closingAtt: false,
			admin: false
		}
		
		this.handleEvent = this.handleEvent.bind(this);
		this.trySubmit = this.trySubmit.bind(this);
  }

  componentDidMount() {
		 // Connect the initMap() function within this class to the global window context,
        // so Google Maps can invoke it
        //window.initMap = this.initMap;
        // Asynchronously load the Google Maps script, passing in the callback reference
				//loadJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyD_Brakef26k_3vGI9T5I8d--giSRrJ86c&callback=initMap')
				
				firebase.auth().onAuthStateChanged((user) => {
					if (user) {
						this.setState({
							enabled: true,
							user: user
						})
					 isGeneralAdmin(user.displayName, user.email).then(isGenAdmin => {
						 this.setState({
							 admin: isGenAdmin
						 })
					 })
					}
					else {
						this.setState({
							enabled: false,
							user: null,
							admin: false
						})
					}
				 });
			}

	initMap () {
	//	map = new google.maps.Map(this.refs.map.getDOMNode(), { ... });
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
	updateCheck = () => {this.setState({'closingAtt':!this.state.closingAtt})}

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
		addEvent(this.props.currentOrg, year, date, time_start, time_end, name, 1,1, this.state.closingAtt);
		this.setState({'submitted':true,
					   'error':false,
					   event_name: '',
					   event_date: {},
					   event_time_start: {},
					   event_time_end: {},
					   closingAtt: false
					  });
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
         		<FlatButton onClick={() => signIn()} labelStyle={{color:"#FFFFFF"}} label={"SIGN-IN"} 
          backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336"/>
          	<p style = {{color:"#DAA520", "marginTop":"10px"}}>If sign-in button doesn't work, make sure pop-ups are enabled and try again</p>
          	<p style = {{color:"#DAA520"}}>(wait a few seconds after returning from sign-in page for this screen to refresh)</p>
        </div> 
				: 
				(this.state.admin ? 
				<div>
				<DropDownMenu maxHeight={300} value={this.props.currentOrg} onChange={this.changeOrg}>
        	{orgsList}
      	</DropDownMenu>
				<div style={{"padding":"10px"}}></div>
        <div style={{"display":"flex"}}>
					  <div style={{"flex":"1"}}> 
						<div style = {{"fontWeight": "bold"}}>Add Event</div>
						<form onSubmit={this.trySubmit}>
							<div></div>
							<TextField name="event_name" value={this.state.event_name} onChange={this.handleEvent}
							hintText="e.g. General Council" floatingLabelText="Event Name" style={{"marginTop":"0px"}}/>
							<TimePicker value={this.state.event_time_start} hintText="Choose Start Time (default: now)" onChange={this.setTimeStart}/>
							<TimePicker value={this.state.event_time_end} hintText="Choose End Time (default: now)" onChange={this.setTimeEnd}/>
							<DatePicker value={this.state.event_date} firstDayOfWeek={0} hintText="Choose Date (default: today)" onChange={this.setDate}/>
							<div style={{"maxWidth":"200px","marginLeft":"33%"}}>
							<Checkbox label="Closing Attendance" checked={this.state.closingAtt}
												onCheck={this.updateCheck}/></div>
							<div style={{"padding":"10px"}}></div>
							<div>Map here</div>
							<div style={{"padding":"10px"}}></div>
							<FlatButton labelStyle={{color:"#FFFFFF"}} label="Add Event" 
							backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336" 
							type="submit" />
						</form>
						{this.state.error ? <div style={{"color":"red","padding":"10px"}}>Please fill in all fields.</div> : null}
						{this.state.submitted ? <div style={{"color":"green","padding":"10px"}}>Event added successfully!</div> : null}
						</div>
						<div style={{"flex":"1"}}> 
						<div style = {{"fontWeight": "bold"}}>View Events</div>
						<List>
          	{eventsList}
         	 	</List>
							<div></div>
							</div>
        </div>
				</div> : <div>You are not an admin.</div>)
      )
    )
  }
}

const mapState = (state) => ({
	events: state.events,
	orgs: state.organizations,
	currentOrg: state.currentOrg
})
const mapDispatch = (dispatch) => {
	return {
	onChangeOrg(newOrg){ 
		dispatch(setOrg(newOrg)); 
		dispatch(fetchEventsThunk())}
}}

export default connect(mapState, mapDispatch)(Admin);

