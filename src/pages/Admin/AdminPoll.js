import React from 'react'
import { connect } from 'react-redux'
import firebase, { addPoll, signIn, isGeneralAdmin } from '../../firebase'


import LocationPickerExample from './Map'
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add';
import Close from 'material-ui/svg-icons/navigation/close';
import {List, ListItem} from 'material-ui/List';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';

import { setOrg } from '../../store/actions'

const Admin = ({ orgs, currentOrg, onChangeOrg }) => (
	<div className = "admin">
		<AdminPollWindow orgs={orgs} currentOrg={currentOrg} onChangeOrg={onChangeOrg}/>
    </div>
);

function loadJS(src) {
	var ref = window.document.getElementsByTagName("script")[0];
	var script = window.document.createElement("script");
	script.src = src;
	script.async = true;
	ref.parentNode.insertBefore(script, ref);
}

class AdminPollWindow extends React.Component {
	constructor(props){
    super(props);
    this.state = {
      enabled: false,
			user: null,
			poll_question: '',
			poll_options: ['','','','','','','','','',''],
			number_poll_options: 2,
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

	setPollOption = (e, key) => {
		let newPollOptions = this.state.poll_options;
		newPollOptions[key] = e.target.value;
		this.setState({'poll_options':newPollOptions})
	}

	incrementOptions = (e, key) => {this.setState({number_poll_options:this.state.number_poll_options+1})}
	decrementOptions = (e, key) => {this.setState({number_poll_options:this.state.number_poll_options-1})}

	changeOrg = (event, index, value) => {
		if(value){this.props.onChangeOrg(value);}
	}	

	trySubmit (e) {
		e.preventDefault();
		let question = this.state.poll_question;
		let optionsArr = this.state.poll_options.slice(0, this.state.number_poll_options);
		let isOptionsComplete = true;
		for(let x = 0; x < optionsArr.length; x++){
			if(optionsArr[x] === ""){
				x = optionsArr.length;
				isOptionsComplete = false;
				break;
			}
		}
		if(!(question && isOptionsComplete)){
			this.setState({'error':true,'submitted':false});
			return false;
		}
		addPoll(this.props.currentOrg, "2018", question, optionsArr, 1, 1);
		this.setState({'submitted':true,
									 'error':false,
									 poll_question: '',
									 poll_options: ['','','','','','','','','',''],
									 number_poll_options: 2
									});
		return true;
	}

  render() {
		/*
		var eventsList = [];
    for(var j = 0; j < this.props.events.length; j++){
        eventsList.push(<ListItem key={j} value={this.props.events[j]} primaryText={this.props.events[j]}></ListItem>);
		}
		*/

		let optionsList = [];
		for(let k = 0; k < this.state.number_poll_options-1; k++){
			const id = k;
			optionsList.push(<div key={k}><TextField name="poll_question" value={this.state.poll_options[k]} onChange={(e) => this.setPollOption(e,id)}
			hintText="e.g. Rutgers Red" floatingLabelText={"Poll Option " + (k+1).toString()} key={k} style={{"marginTop":"0px"}}/>
			<Close color="#FFFFFF"/>
			</div>);
		}

		if(this.state.number_poll_options === 2){
			optionsList.push(<div key={1}><TextField name="poll_question" value={this.state.poll_options[1]} onChange={(e) => this.setPollOption(e,1)}
			hintText="e.g. Rutgers Red" floatingLabelText={"Poll Option 2"} key={1} style={{"marginTop":"0px"}}/>
			<Close color="#FFFFFF"/>
			</div>);
		}
		else{
			let k = this.state.number_poll_options - 1;
			optionsList.push(<div key={k}><TextField name="poll_question" value={this.state.poll_options[k]} 
			onChange={(e) => this.setPollOption(e,k)} hintText="e.g. Rutgers Red" 
			floatingLabelText={"Poll Option " + (k+1).toString()} key={k} style={{"marginTop":"0px"}}/>
			<Close onClick={this.decrementOptions}/>
			</div>);
		}

		let orgsList = [];
    for(let i = 0; i < this.props.orgs.length; i++){
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
						<div style = {{"fontWeight": "bold"}}>Add Poll</div>
						<form onSubmit={this.trySubmit}>
							<div>
								<TextField name="poll_question" value={this.state.poll_question} 
									onChange={this.handleEvent} hintText="e.g. What's your favorite color?" 
									floatingLabelText={"Poll Question"} style={{"marginTop":"0px"}}/>
								<Close color="#FFFFFF"/>
							</div>
							<div>________________</div>
							{optionsList}
							<p></p>
							{this.state.number_poll_options < 10 ?
							<FloatingActionButton mini={true} backgroundColor="#F44336" onClick={this.incrementOptions}>
								<ContentAdd/>
							</FloatingActionButton>
							: null}
							<p></p>
							<div>Map here</div>
							<div style={{"padding":"10px"}}></div>
							<FlatButton labelStyle={{color:"#FFFFFF"}} label="Add Poll" 
							backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336" 
							type="submit" />
						</form>
						{this.state.error ? <div style={{"color":"red","padding":"10px"}}>Please fill in all fields.</div> : null}
						{this.state.submitted ? <div style={{"color":"green","padding":"10px"}}>Poll added successfully!</div> : null}
						</div>
						<div style={{"flex":"1"}}> 
						<div style = {{"fontWeight": "bold"}}>View Polls</div>
						<DropDownMenu maxHeight={300} value={this.props.currentOrg} onChange={this.changeOrg}>
      			</DropDownMenu>
							<div></div>
							</div>
        </div>
				</div> : <div>You are not an admin.</div>)
      )
    )
  }
}

const mapState = (state) => ({
	orgs: state.organizations,
	currentOrg: state.currentOrg
})
const mapDispatch = (dispatch) => {
	return {
	onChangeOrg(newOrg){ 
		dispatch(setOrg(newOrg)); 
		//dispatch(fetchPollsThunk())
	}
}}

export default connect(mapState, mapDispatch)(Admin);