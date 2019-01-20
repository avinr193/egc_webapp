import React from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import firebase, { addEvent, signIn, isGeneralAdmin } from '../../firebase'
import 'firebase/auth'

import Loader from 'react-loader-spinner';

import { LocationPickerExample } from './Map'
import FlatButton from 'material-ui/FlatButton';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import styled from 'styled-components';

import {
	setOrg, fetchEventsThunk, setIsAdminThunk, fetchYear, offWatchAttendanceAdded,
	offWatchPollAdded, watchAttendanceAdded, watchPollAdded, fetchYearsThunk
} from '../../store/actions'


import AttendanceWindow from "./AdminAtt";
const Container = styled.div`
 justify-content: center;
 display: flex;
`;

const Admin = ({ events, attendance, currentEvent, onChangeOrg, onAddEvent, onChangeDate, eventDate, eventDates,
	currentDate, currentOrg, onChangeAtt, onSetEventLive, isEventLive, onSetAttPath, attPath, onIsAdmin,
	isAdmin, currentLiveEvent, onLiveEventUpdate, orgs, years, onChangeYear, currentYear, onMount, loading }) => (
		<div className="admin">
			<AdminEvntWindow events={events} attendance={attendance} onAddEvent={onAddEvent}
				currentEvent={currentEvent} eventDate={eventDate} eventDates={eventDates}
				onChangeDate={onChangeDate} currentDate={currentDate} currentOrg={currentOrg}
				onChangeAtt={onChangeAtt} onSetEventLive={onSetEventLive} isEventLive={isEventLive}
				onSetAttPath={onSetAttPath} attPath={attPath} onIsAdmin={onIsAdmin} isAdmin={isAdmin}
				currentLiveEvent={currentLiveEvent} onLiveEventUpdate={onLiveEventUpdate} orgs={orgs}
				years={years} currentYear={currentYear} onChangeOrg={onChangeOrg} onMount={onMount}
				onChangeYear={onChangeYear} loading={loading}/>
		</div>
	);

class AdminEvntWindow extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			enabled: false,
			user: null,
			event_name: '',
			event_date: {},
			event_time_start: {},
			event_time_end: {},
			closingAtt: false,
			lat: 1,
			long: 1,
			radius: 50,
			submitted: false,
			error: false
		}

		this.handleEvent = this.handleEvent.bind(this);
		this.trySubmit = this.trySubmit.bind(this);
	}

	componentDidMount() {
		this.props.onMount();
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				this.setState({
					enabled: true,
					user: user
				})
				if (!this.props.isAdmin) {
					isGeneralAdmin(user.email).then(isGenAdmin => {
						this.props.onIsAdmin(isGenAdmin, user.email);
					})
				}
			}
			else {
				if (this.props.isAdmin) {
					this.props.onIsAdmin(false);
				}
				this.setState({
					enabled: false,
					user: null
				})
			}
		});
	}


	handleEvent(e) {
		this.setState({ [e.target.name]: e.target.value });
		this.clearState();
	}

	setTimeStart = (e, time_start) => { this.setState({ 'event_time_start': time_start }) }
	setTimeEnd = (e, time_end) => { this.setState({ 'event_time_end': time_end }) }
	setDate = (e, date) => { this.setState({ 'event_date': date }) }
	updateCheck = () => { this.setState({ 'closingAtt': !this.state.closingAtt }) }

	trySubmit(e) {
		e.preventDefault();
		let isNameClean = true;
		let name = this.state.event_name.toUpperCase();
		if (/[.[\]$#]/.test(name)) { isNameClean = false; }
		let date = moment(this.state.event_date).format('M-D');
		let year = moment(this.state.event_date).format('YYYY');
		let time_start = moment(this.state.event_time_start).format('hh:mm A');
		let time_end = moment(this.state.event_time_end).format('hh:mm A');
		if (!(date && year && time_start && time_end && name && isNameClean)) {
			this.setState({ 'error': true, 'submitted': false });
			return false;
		}
		addEvent(this.props.currentOrg, year, date, time_start, time_end, name, this.state.lat,
			this.state.long, this.state.radius, this.state.closingAtt);
		this.setState({
			'submitted': true,
			'error': false,
			event_name: '',
			event_date: {},
			event_time_start: {},
			event_time_end: {},
			closingAtt: false
		});
		this.props.onAddEvent(name);
		return true;
	}

	changeOrg(event, index, value) {
		if (value) {
			this.clearState();
			this.props.onChangeOrg(value);
		}
	}

	changeYear(event, index, value) {
		if (value) {
			this.clearState();
			this.props.onChangeYear(value);
		}
	}

	updateLocation = (e, position, radius) => {
		this.setState({
			lat: position.lat,
			long: position.lng,
			radius: radius
		})
	}

	clearState = () => {
		this.setState({
			submitted: false,
			error: false
		})
	}

	render() {
		let orgsList = [];
		for (let i = 0; i < this.props.orgs.length; i++) {
			orgsList.push(<MenuItem key={i} value={this.props.orgs[i]} primaryText={this.props.orgs[i]}></MenuItem>);
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
						<div style={{ "display": "flex", "overflow":"hidden", "height":"77vh" }}>
							{this.props.currentYear === today.getFullYear().toString() ?
								<div style={{ "flex": "1","overflow":"scroll" }}>
									<div style={{ "fontWeight": "bold" }}>Add Event</div>
									<form onSubmit={this.trySubmit}>
										<div></div>
										<TextField name="event_name" value={this.state.event_name} onChange={this.handleEvent}
											hintText="e.g. General Council" floatingLabelText="Event Name" style={{ "marginTop": "0px" }} />
										<TimePicker value={this.state.event_time_start} hintText="Choose Start Time (default: now)" onChange={this.setTimeStart} />
										<TimePicker value={this.state.event_time_end} hintText="Choose End Time (default: now)" onChange={this.setTimeEnd} />
										<DatePicker minDate={today} value={this.state.event_date} firstDayOfWeek={0} hintText="Choose Date (default: today)" onChange={this.setDate} />
										<Container>
											<div style={{ "maxWidth": "40px", "marginRight": "110px" }}>
												<Checkbox label="Closing Attendance" checked={this.state.closingAtt}
													onCheck={this.updateCheck} /></div>
										</Container>
										<div style={{ "padding": "10px" }}></div>
										<div style={{"display":"flex","justifyContent":"center"}}>
										<LocationPickerExample onChange={this.updateLocation} /></div>
										<div style={{ "padding": "10px" }}></div>
										{this.state.error ? <div style={{ "color": "red", "padding": "10px" }}>Please fill in all fields, and do not use the following characters for event name: . $ # [ ]</div> : null}
										{this.state.submitted ? <div style={{ "color": "green", "padding": "10px" }}>Event added successfully!</div> : null}
										<FlatButton labelStyle={{ color: "#FFFFFF" }} label="Add Event"
											backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336"
											type="submit" />
									</form>
								</div>
								: <div style={{ "flex": "1" }}>Must be in current year to add events.</div>}
							<div style={{ "flex": "1","overflow":"scroll" }}>
								<div style={{ "fontWeight": "bold" }}>View Events</div>
								{this.props.events.length > 0 ? 
								<AttendanceWindow events={this.props.events} attendance={this.props.attendance} onChangeEvent={this.props.onChangeEvent}
									currentEvent={this.props.currentEvent} eventDate={this.props.eventDate} eventDates={this.props.eventDates}
									onChangeDate={this.props.onChangeDate} currentDate={this.props.currentDate} currentOrg={this.props.currentOrg}
									onChangeAtt={this.props.onChangeAtt} onSetEventLive={this.props.onSetEventLive} isEventLive={this.props.isEventLive}
									onSetAttPath={this.props.onSetAttPath} attPath={this.props.attPath} onIsAdmin={this.props.onIsAdmin} isAdmin={this.props.isAdmin}
									currentLiveEvent={this.props.currentLiveEvent} onLiveEventUpdate={this.props.onLiveEventUpdate} orgs={this.props.orgs}
									years={this.props.years} currentYear={this.props.currentYear} clearState={this.clearState}/>
								: (this.props.loading ? <div style={{"padding":"25px"}}>
								<Loader type="Triangle" color="#F44336" height={80} width={80}/></div> 
								: <div style={{"padding":"25px"}}>No events to view.</div>)}
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
	currentOrg: state.currentOrg,
	isAdmin: state.isAdmin,
	currentYear: state.currentYear,
	years: state.years,
	loading: state.loading
})
const mapDispatch = (dispatch) => {
	return {
		onChangeOrg(newOrg) {
			dispatch(offWatchAttendanceAdded());
			dispatch(offWatchPollAdded());
			dispatch(setOrg(newOrg));
			dispatch(fetchYearsThunk(newOrg, "events"));
			dispatch(watchAttendanceAdded(newOrg));
			dispatch(watchPollAdded(newOrg));
		},
		onChangeYear(newYear) {
			dispatch(fetchYear(newYear));
			dispatch(fetchEventsThunk());
		},
		onIsAdmin(isGenAdmin, email=null) {
			dispatch(setIsAdminThunk(isGenAdmin, email));
		},
		onAddEvent(eventName) {
			dispatch(fetchEventsThunk(null,eventName));
		},
		onMount(){
			dispatch(fetchEventsThunk());
		}
	}
}

export default connect(mapState, mapDispatch)(Admin);

