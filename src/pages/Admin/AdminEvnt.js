import React from 'react'
import { connect } from 'react-redux'
import firebase from '../../firebase'

import FlatButton from 'material-ui/FlatButton';
import {List, ListItem} from 'material-ui/List';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';

const Admin = ({ events, orgs }) => (
	<div className = "admin">
		<AdminEvntWindow events = {events} orgs = {orgs} />
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
			event_time_end: {},
			current_org: ''
		}
		
		this.handleEvent = this.handleEvent.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
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

	setEvent = (org) => {this.setState({'current_org': org})}	
	setTimeStart = (time_start) => {this.setState({'event_time_start':time_start})}
	setTimeEnd = (time_end) => {this.setState({'event_time_end':time_end})}
	setDate = (date) => {this.setState({'event_date':date})}

	handleSubmit (e) {
		console.log("NAME: " + this.state.event_name + " DATE: " + this.state.event_date);
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
        <div style={{"display":"flex"}}>
					  <div style={{"flex":"1"}}> 
						<div style = {{"font-weight": "bold"}}>Add Event</div>
						<form onSubmit={this.handleSubmit} style={{"padding":"5px"}}>
							<label>Organization Name:&nbsp; <div></div>
								<DropDownMenu maxHeight={300} value={this.state.current_org} onChange={this.setEvent}>
        				{orgsList}
      					</DropDownMenu>
  						</label>
							<div></div>
							<label>
								<TextField name="event_name" value={this.state.event_name} onChange={this.handleEvent}
								hintText="e.g. General Council" floatingLabelText="Event Name" style={{"margin-top":"0px"}}/>
  						</label>
							<div style={{"padding":"10px"}}></div>
							<label>
								Period Attendance is active:
								<TimePicker value={this.state.event_time_start} hintText="Choose Start Time" onChange={this.setTimeStart}/>
								<TimePicker value={this.state.event_time_end} hintText="Choose End Time" onChange={this.setTimeEnd}/>
								<DatePicker value={this.state.event_date} firstDayOfWeek={0} hintText="Choose Date" onChange={this.setDate}/>
							</label>
  						<FlatButton labelStyle={{color:"#FFFFFF"}} label="Add Event" 
							backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336" 
							type="submit" value="Submit" />
						</form>
						</div>
						<div style={{"flex":"1"}}> 
						<div style = {{"font-weight": "bold", "margin-top":"25px"}}>View Events</div>
						<List>
          	{eventsList}
         	 	</List>
							<div></div>
							</div>
        </div>
      )
    )
  }
}

const mapState = (state) => ({
	events: state.events,
	orgs: state.organizations
})
const mapDispatch = (dispatch) => ({
})

export default connect(mapState, mapDispatch)(Admin);