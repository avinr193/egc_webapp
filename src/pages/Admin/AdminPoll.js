import React from 'react'
import { connect } from 'react-redux'
import firebase, { addPoll, signIn, isGeneralAdmin, addLivePoll, removeLivePoll } from '../../firebase'
import 'firebase/auth'

import { LocationPickerExample } from './Map'
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add';
import Close from 'material-ui/svg-icons/navigation/close';
import { List, ListItem } from 'material-ui/List';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import Slider from 'material-ui/Slider';
import AllInclusive from 'material-ui/svg-icons/places/all-inclusive';
import styled from 'styled-components';

import { setOrg, setPoll, fetchPollsThunk, checkPollLive, fetchAndSetPoll, setIsAdmin, 
	fetchLivePollsThunk, fetchYear, watchAttendanceAdded, watchPollAdded, offWatchAttendanceAdded,
	offWatchPollAdded } from '../../store/actions'

const Container = styled.div`
 justify-content: center;
 display: flex;
`;

const Admin = ({ orgs, currentOrg, onChangeOrg, polls, currentPoll, onChangePoll,
	isPollLive, onSetPollLive, fetchAndSetPoll, onIsAdmin, isAdmin, currentLivePoll, onLivePollUpdate,
	currentYear, years, onChangeYear }) => (
		<div className="admin">
			<AdminPollWindow orgs={orgs} currentOrg={currentOrg} onChangeOrg={onChangeOrg}
				polls={polls} currentPoll={currentPoll} onChangePoll={onChangePoll} isPollLive={isPollLive}
				onSetPollLive={onSetPollLive} fetchAndSetPoll={fetchAndSetPoll} onIsAdmin={onIsAdmin}
				isAdmin={isAdmin} currentLivePoll={currentLivePoll} onLivePollUpdate={onLivePollUpdate} 
				currentYear={currentYear} years={years} onChangeYear={onChangeYear}/>
		</div>
	);

class AdminPollWindow extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			enabled: false,
			user: null,
			poll_question: '',
			poll_options: [{ text: '', count: 0 },
			{ text: '', count: 0 },
			{ text: '', count: 0 },
			{ text: '', count: 0 },
			{ text: '', count: 0 },
			{ text: '', count: 0 },
			{ text: '', count: 0 },
			{ text: '', count: 0 },
			{ text: '', count: 0 },
			{ text: '', count: 0 }],
			number_poll_options: 2,
			lat: 1,
			long: 1,
			radius: 50
		}

		this.handleEvent = this.handleEvent.bind(this);
		this.trySubmit = this.trySubmit.bind(this);
	}

	componentDidMount() {
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


	addRemoveLive(e, isInputChecked) {
		if (isInputChecked) {
			addLivePoll(this.props.currentPoll)
		}
		else {
			removeLivePoll(this.props.currentPoll)
		}
		this.props.onSetPollLive();
	}

	handleEvent(e) {
		this.setState({ [e.target.name]: e.target.value });
	}

	setPollOption = (e, key) => {
		let newPollOptions = this.state.poll_options;
		newPollOptions[key].text = e.target.value;
		this.setState({ 'poll_options': newPollOptions })
	}

	incrementOptions = (e, key) => { this.setState({ number_poll_options: this.state.number_poll_options + 1 }) }
	decrementOptions = (e, key) => { this.setState({ number_poll_options: this.state.number_poll_options - 1 }) }

	changePoll = (event, index, value) => {
		let newPoll = this.props.polls[index];
		if (this.props.polls[index].question === value) {
			this.props.onChangePoll(newPoll);
		}
		else {
			console.error("Poll mismatch.")
		}
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

	trySubmit(e) {
		e.preventDefault();
		let question = this.state.poll_question;
		let optionsArr = this.state.poll_options.slice(0, this.state.number_poll_options);
		let isOptionsComplete = true;
		for (let x = 0; x < optionsArr.length; x++) {
			if (optionsArr[x].text.length === 0) {
				x = optionsArr.length;
				isOptionsComplete = false;
				break;
			}
		}
		if (!(question.length > 0 && isOptionsComplete)) {
			this.setState({ 'error': true, 'submitted': false });
			return false;
		}
		let id = addPoll(this.props.currentOrg, this.props.currentYear, question, optionsArr, this.state.lat, this.state.long, this.state.radius);
		this.props.fetchAndSetPoll(id);
		this.setState({
			'submitted': true,
			'error': false,
			poll_question: '',
			poll_options: [{ text: '', count: 0 },
			{ text: '', count: 0 },
			{ text: '', count: 0 },
			{ text: '', count: 0 },
			{ text: '', count: 0 },
			{ text: '', count: 0 },
			{ text: '', count: 0 },
			{ text: '', count: 0 },
			{ text: '', count: 0 },
			{ text: '', count: 0 }],
			number_poll_options: 2
		});
		return true;
	}

	updateLocation = (e, position, radius) => {
		this.setState({
			lat: position.lat,
			long: position.lng,
			radius: radius
		})
	}

	updateLivePollLocation(e, val) {
		let newLivePoll = this.props.currentLivePoll;
		newLivePoll.location.radius = val;
		addLivePoll(newLivePoll);
		this.props.onLivePollUpdate();
	}

	render() {
		let pollsList = [];
		for (let i = 0; i < this.props.polls.length; i++) {
			pollsList.push(<MenuItem key={i} value={this.props.polls[i].question} primaryText={this.props.polls[i].question}></MenuItem>);
		}

		let optionsList = [];
		for (let k = 0; k < this.state.number_poll_options - 1; k++) {
			const id = k;
			optionsList.push(<div key={k}><TextField name="poll_question" value={this.state.poll_options[k].text} onChange={(e) => this.setPollOption(e, id)}
				hintText="e.g. Rutgers Red" floatingLabelText={"Poll Option " + (k + 1).toString()} key={k} style={{ "marginTop": "0px" }} />
				<Close color="#FFFFFF" />
			</div>);
		}

		if (this.state.number_poll_options === 2) {
			optionsList.push(<div key={1}><TextField name="poll_question" value={this.state.poll_options[1].text} onChange={(e) => this.setPollOption(e, 1)}
				hintText="e.g. Rutgers Red" floatingLabelText={"Poll Option 2"} key={1} style={{ "marginTop": "0px" }} />
				<Close color="#FFFFFF" />
			</div>);
		}
		else {
			let k = this.state.number_poll_options - 1;
			optionsList.push(<div key={k}><TextField name="poll_question" value={this.state.poll_options[k].text}
				onChange={(e) => this.setPollOption(e, k)} hintText="e.g. Rutgers Red"
				floatingLabelText={"Poll Option " + (k + 1).toString()} key={k} style={{ "marginTop": "0px" }} />
				<Close onClick={this.decrementOptions} />
			</div>);
		}

		let orgsList = [];
		for (let i = 0; i < this.props.orgs.length; i++) {
			orgsList.push(<MenuItem key={i} value={this.props.orgs[i]} primaryText={this.props.orgs[i]}></MenuItem>);
		}

		let yearsList = [];
    	for (let k = 0; k < this.props.years.length; k++) {
      		yearsList.push(<MenuItem key={k} value={this.props.years[k]} primaryText={this.props.years[k]}></MenuItem>);
    	}
		let today = new Date();

		let currentPollOptions = [];
		for (let y = 0; y < this.props.currentPoll.options.length; y++) {
			currentPollOptions.push(
				<div key={y}>
					<ListItem value={this.props.currentPoll.options[y].text} primaryText={this.props.currentPoll.options[y].text}
						secondaryText={this.props.currentPoll.options[y].count.toString()}></ListItem>
				</div>
			)
		}

		let currentPollPeople = [];
		if (this.props.currentPoll.people) {
			if (this.props.currentPoll.people[0]) {
				Object.keys(this.props.currentPoll.people).forEach(key => {
					currentPollPeople.push(
						<div key={key}>
							<ListItem value={this.props.currentPoll.people[key].name} primaryText={this.props.currentPoll.people[key].name}
								secondaryText={"Time Logged: " + this.props.currentPoll.people[key].time_logged + ", Distance: "
									+ this.props.currentPoll.people[key].location.distance.toFixed(3)}></ListItem>
						</div>
					)
				});
			}
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
				(this.props.isAdmin ?
					<div>
						<DropDownMenu maxHeight={300} value={this.props.currentOrg} onChange={this.changeOrg.bind(this)}>
							{orgsList}
						</DropDownMenu>
						<DropDownMenu maxHeight={300} value={this.props.currentYear} onChange={this.changeYear.bind(this)}>
            				{yearsList}
          				</DropDownMenu>
						<div style={{ "padding": "10px" }}></div>
						<div style={{ "display": "flex" }}>
						{this.props.currentYear === today.getFullYear().toString() ? 
							<div style={{ "flex": "1" }}>
								<div style={{ "fontWeight": "bold" }}>Add Poll</div>
								<form onSubmit={this.trySubmit}>
									<div>
										<TextField name="poll_question" value={this.state.poll_question}
											onChange={this.handleEvent} hintText="e.g. What's your favorite color?"
											floatingLabelText={"Poll Question"} style={{ "marginTop": "0px" }} />
										<Close color="#FFFFFF" />
									</div>
									<div>________________</div>
									{optionsList}
									<p></p>
									{this.state.number_poll_options < 10 ?
										<FloatingActionButton mini={true} backgroundColor="#F44336" onClick={this.incrementOptions}>
											<ContentAdd />
										</FloatingActionButton>
										: null}
									<p></p>
									<div><LocationPickerExample onChange={this.updateLocation} /></div>
									<div style={{ "padding": "10px" }}></div>
									{this.state.error ? <div style={{ "color": "red", "padding": "10px" }}>Please fill in all fields.</div> : null}
									{this.state.submitted ? <div style={{ "color": "green", "padding": "10px" }}>Poll added successfully!</div> : null}
									<FlatButton labelStyle={{ color: "#FFFFFF" }} label="Add Poll"
										backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336"
										type="submit"/>
								</form>
							</div>
							: <div style={{ "flex": "1" }}>Must be in current year to add polls.</div>}
							<div style={{ "flex": "1" }}>
								<div style={{ "fontWeight": "bold" }}>View Polls</div>
								<DropDownMenu maxHeight={300} value={this.props.currentPoll.question} onChange={this.changePoll}>
									{pollsList}
								</DropDownMenu>
								{this.props.currentYear === today.getFullYear().toString() && this.props.polls.length > 0 ?
								<Container>
									<div>
										<div style={{ "marginTop": "10px" }}>
											<Toggle label="Live:" toggled={this.props.isPollLive} onToggle={(e, isInputChecked) => this.addRemoveLive(e, isInputChecked)}></Toggle></div>
									</div>
								</Container>
								: null}
								{(this.props.isPollLive && this.props.currentLivePoll) ?
									<div>
										<div style={{ "marginTop": "10px" }}>Live Poll Radius: {this.props.currentLivePoll.location.radius}m</div>
										<Container>
											<Slider defaultValue={this.props.currentLivePoll.location.radius} value={this.props.currentLivePoll.location.radius}
												max={500} min={10} style={{ "width": "100%", "maxWidth": "250px" }}
												sliderStyle={{ "marginBottom": "9px", "marginTop": "9px" }} onChange={(e, val) => this.val = val}
												onDragStop={(e) => this.updateLivePollLocation(e, this.val)}></Slider>
											<div style={{"padding":"5px"}}></div>
            								<IconButton style={{"width":"72","height":"72","padding":"0px"}}
              								onClick={(e) => this.updateLivePollLocation(e, 5000000000)}><AllInclusive/></IconButton>
										</Container>
									</div>
									: null}
								<p></p>
								<div style={{ "fontWeight": "bold" }}>Vote Count:</div>
								<List>
									{currentPollOptions}
								</List>
								<div style={{ "fontWeight": "bold" }}>People:</div>
								<List style={{ "maxHeight": "400px", "overflow": "scroll" }}>
									{currentPollPeople}
								</List>
							</div>
						</div>
					</div> : <div>You are not an admin.</div>)
			)
		)
	}
}

const mapState = (state) => ({
	orgs: state.organizations,
	currentOrg: state.currentOrg,
	polls: state.polls,
	currentPoll: state.currentPoll,
	isPollLive: state.isPollLive,
	isAdmin: state.isAdmin,
	currentLivePoll: state.currentLivePoll,
	currentYear: state.currentYear,
	years: state.years
})
const mapDispatch = (dispatch) => {
	return {
		onChangeOrg(newOrg) {
			dispatch(offWatchAttendanceAdded());
			dispatch(offWatchPollAdded());
			dispatch(setOrg(newOrg));
			dispatch(fetchPollsThunk());
			dispatch(watchAttendanceAdded());
			dispatch(watchPollAdded());
		},
		onChangePoll(newPoll) {
			dispatch(setPoll(newPoll));
			dispatch(checkPollLive());
		},
		onChangeYear(newYear) {
			dispatch(fetchYear(newYear));
			dispatch(fetchPollsThunk());
		},
		onSetPollLive() {
			dispatch(checkPollLive());
		},
		fetchAndSetPoll(id, org) {
			dispatch(fetchAndSetPoll(id, org))
		},
		onIsAdmin(isGenAdmin, email) {
			dispatch(setIsAdmin(isGenAdmin, email));
		},
		onLivePollUpdate() {
			dispatch(fetchLivePollsThunk());
		}
	}
}

export default connect(mapState, mapDispatch)(Admin);