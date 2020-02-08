import React from 'react'
import { connect } from 'react-redux'
import 'firebase/auth'
import firebase, { signIn, isSpecificAdmin, addOrg, addAdminOrg, addAdmin, deleteAdminOrg, addElevatedAdmin } from '../../firebase'

import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import Close from 'material-ui/svg-icons/navigation/close';
import { List, ListItem } from 'material-ui/List';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';

import { setIsAdminThunk, fetchAllOrgsThunk, fetchAdminsThunk, setAdmin, fetchOrgsThunk, fetchOrgs, fetchElevatedAdminsThunk } from '../../store/actions'

const Admin = ({onIsAdmin, isAdmin, orgs, currentYear, admins, currentAdmin, onChangeAdmin, allOrgs, 
  resetOrgs, onAddOrg, onAddAdmin, elevAdmins, onAddElevatedAdmin}) => (
	<div className = "admin">
    <AdminAdOrgsWindow onIsAdmin={onIsAdmin} isAdmin={isAdmin} orgs={orgs} 
    currentYear={currentYear} admins={admins} currentAdmin={currentAdmin}
    onChangeAdmin={onChangeAdmin} allOrgs={allOrgs} resetOrgs={resetOrgs} onAddOrg={onAddOrg}
    onAddAdmin={onAddAdmin} elevAdmins={elevAdmins} onAddElevatedAdmin={onAddElevatedAdmin}/>
    </div>
);

class AdminAdOrgsWindow extends React.Component {
	constructor(props){
    super(props);
    this.state = {
      enabled: false,
      user: null,
      newOrgName : '',
      newAdminOrgName: '',
      allOrgError: '',
      adminOrgError: '',
      addAdminError: '',
      newAdminName: '',
      newElevatedAdminName: '',
      addElevatedAdminError: ''
    }
  }

  componentDidMount() {
		firebase.auth().onAuthStateChanged((user) => {
		  if (user) {
			this.setState({
			  enabled: true,
			  user: user
      })
      this.props.onIsAdmin(false);
			if(!this.props.isAdmin){
				isSpecificAdmin(user.email).then(isSpecAdmin => {
			 		this.props.onIsAdmin(isSpecAdmin, user.email);
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
    
    changeAdmin(event, index, value) {
      if (value) {
        this.setState({
          adminOrgError: ""
        })
        this.props.onChangeAdmin(value);
      }
      }

    componentWillUnmount() {
      this.props.resetOrgs();
    }

    setNewOrgName = (e) => {
      this.setState({ 'newOrgName': e.target.value })
    }

    setNewAdminOrgName = (e) => {
      this.setState({ 'newAdminOrgName': e.target.value })
    }

    setNewAdminName = (e) => {
      this.setState({ 'newAdminName': e.target.value })
    }

    setNewElevatedAdminName = (e) => {
      this.setState({ 'newElevatedAdminName': e.target.value })
    }

    checkAddOrg() {
      let newOrg = this.state.newOrgName.replace(/\b\w/g, function(l){ return l.toUpperCase() });
      if(this.props.allOrgs.includes(newOrg)){
        this.setState({
          allOrgError: 'That organization already exists.'
        })
      }
      else{
        this.setState({
          allOrgError: ''
        })
        addOrg(newOrg, this.props.currentYear);
        this.props.onAddOrg();
        this.setNewOrgName({target: {value: ''}});
      }
    }

    checkAdminOrg() {
      let newAdminOrg = this.state.newAdminOrgName.replace(/\b\w/g, function(l){ return l.toUpperCase() });
      if(!this.props.allOrgs.includes(newAdminOrg) || newAdminOrg.length === 0){
        this.setState({
          adminOrgError: 'That organization does not exist.'
        })
      }
      else{
        this.setState({
          adminOrgError: ''
        })
        addAdminOrg(newAdminOrg, this.props.currentAdmin);
        this.props.onChangeAdmin(this.props.currentAdmin);
        this.setNewAdminOrgName({target: {value: ''}})
      }
    }

    checkAdmin() {
      if(!this.state.newAdminName.length > 0){
        this.setState({
          addAdminError: 'No netID entered.'
        })
      }
      else{
        this.setState({
          addAdminError: ''
        })
        addAdmin(this.state.newAdminName);
        this.props.onAddAdmin(this.state.newAdminName);
        this.setNewAdminName({target: {value: ''}})
      }
    }

    checkElevatedAdmin() {
      if(!this.state.newElevatedAdminName.length > 0){
        this.setState({
          addElevatedAdminError: 'No netID entered.'
        })
      }
      else{
        this.setState({
          addElevatedAdminError: ''
        })
        addElevatedAdmin(this.state.newElevatedAdminName);
        this.props.onAddElevatedAdmin();
        this.setNewElevatedAdminName({target: {value: ''}})
      }
    }

  handleAdminOrgDelete(e){
    if(this.props.orgs.length === 1 & this.props.currentAdmin === this.state.user.email.split('@')[0]){
      this.setState({
        adminOrgError: "Deleting your last organization will demote you from admin and lock you out. Another user must do this."
      })
    } else {
      deleteAdminOrg(this.props.currentAdmin, e);
      this.props.onChangeAdmin(this.props.currentAdmin);
    }
  }

  render() {

    let allOrgsList = [];
		for (let j = 0; j < this.props.allOrgs.length; j++) {
			allOrgsList.push(<ListItem key={j} value={this.props.allOrgs[j]} primaryText={this.props.allOrgs[j]}></ListItem>);
    }
    
    let adminsList = [];
    for (let k = 0; k < this.props.admins.length; k++) {
    		adminsList.push(<MenuItem key={k} value={this.props.admins[k]} primaryText={this.props.admins[k]}></MenuItem>);
    }

    let elevAdminsList = [];
    for (let k = 0; k < this.props.elevAdmins.length; k++) {
    		elevAdminsList.push(<ListItem key={k} value={this.props.elevAdmins[k]} primaryText={this.props.elevAdmins[k]}></ListItem>);
    }

    let orgsList = [];
		for (let j = 0; j < this.props.orgs.length; j++) {
      orgsList.push(<div key={j} style={{"display":"flex","justifyContent":"center"}}><ListItem value={this.props.orgs[j]} 
      primaryText={this.props.orgs[j]} style={{"width":"300px"}}></ListItem>
      <IconButton value={this.props.orgs[j]} onClick={(e) => this.handleAdminOrgDelete(e)}>
      <Close color="#d3d3d3" hoverColor="#F44336" /></IconButton></div>);
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
        <div style = {{"display":"flex"}}>
            <div style={{"flex":"1"}}>
            <div style={{ "fontWeight": "bold" }}>Elevated Admins</div>
            <div style={{"fontStyle":"italic","color":"grey"}}>able to add orgs and designate admins (e.g. access this page)</div>
            <List style={{"maxHeight":"15vh", "overflow":"scroll"}}>
            	{elevAdminsList}
          	</List>
            <TextField name="newElevatedAdmin" value={this.state.newElevatedAdminName} onChange={(e) => this.setNewElevatedAdminName(e)}
				    hintText="e.g. ru098" floatingLabelText={"Add Elevated Admin (enter netID)"} key={3} style={{ "marginTop": "0px" }} />
            <div style={{"padding":"5px"}}></div>
            <FlatButton onClick={() => {this.checkElevatedAdmin()}} labelStyle={{ color: "#FFFFFF" }} label={"Submit"}
						backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336" />
            <div>{this.state.addElevatedAdminError}</div>
            <div style={{"padding":"25px"}}></div>
            <div style={{ "fontWeight": "bold" }}>Organizations</div>
            <List style={{"maxHeight":"28vh", "overflow":"scroll"}}>
							{allOrgsList}
						</List>
            <TextField name="newOrg" value={this.state.newOrgName} onChange={(e) => this.setNewOrgName(e)}
				    hintText="e.g. Rutgers Red Club" floatingLabelText={"Add Organization"} key={1} style={{ "marginTop": "0px" }} />
            <div style={{"padding":"5px"}}></div>
            <FlatButton onClick={() => {this.checkAddOrg()}} label={"Submit"}
						backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336" labelStyle={{ color: "#FFFFFF" }}/>
            <div style={{"color":"red","padding":"25px"}}>{this.state.allOrgError}</div>
            </div>
            <div style={{"flex":"1"}}>
            <div style={{ "fontWeight": "bold" }}>Admins</div>
            <div style={{"fontStyle":"italic","color":"grey"}}>able to create/delete events/polls for specified orgs</div>
            <List style={{"maxHeight":"15vh", "overflow":"scroll"}}>
            	{adminsList}
          	</List>
            <div></div>
            <TextField name="newAdmin" value={this.state.newAdminName} onChange={(e) => this.setNewAdminName(e)}
				    hintText="e.g. ru098" floatingLabelText={"Add Admin (enter netID)"} key={3} style={{ "marginTop": "0px" }} />
            <div style={{"padding":"5px"}}></div>
            <FlatButton onClick={() => {this.checkAdmin()}} labelStyle={{ color: "#FFFFFF" }} label={"Submit"}
						backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336" />
            <div style={{"color":"red","padding":"25px"}}>{this.state.addAdminError}</div>
        <div style={{"fontWeight":"bold"}}>Organizations accessible by:</div>
        <DropDownMenu maxHeight={300} value={this.props.currentAdmin} onChange={this.changeAdmin.bind(this)}>
            	{adminsList}
          	</DropDownMenu>
            <List style={{"maxHeight":"20vh", "overflow":"scroll"}}>
							{orgsList}
						</List>
            <TextField name="newAdminOrg" value={this.state.newAdminOrgName} onChange={(e) => this.setNewAdminOrgName(e)}
				    hintText="e.g. Rutgers Red Club" floatingLabelText={"Add Organization"} key={2} style={{ "marginTop": "0px" }} />
            <div style={{"padding":"5px"}}></div>
            <FlatButton onClick={() => {this.checkAdminOrg()}} labelStyle={{ color: "#FFFFFF" }} label={"Submit"}
						backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336" />
            <div style={{"color":"red","padding":"25px"}}>{this.state.adminOrgError}</div>
            </div>
        </div>
        : <div>You are not an elevated admin.</div>)
      )
    )
  }
}

  const mapState = (state) => ({
    orgs: state.organizations,
    allOrgs: state.allOrganizations,
    isAdmin: state.isAdmin,
    currentYear: state.currentYear,
    admins: state.admins,
    currentAdmin: state.currentAdmin,
    elevAdmins: state.elevAdmins
  })
  const mapDispatch = (dispatch) => {
    dispatch(fetchAllOrgsThunk());
    dispatch(fetchAdminsThunk());
    dispatch(fetchElevatedAdminsThunk());
    return {
      onIsAdmin(isGenAdmin, email=null){
        dispatch(setIsAdminThunk(isGenAdmin, email));
      },
      onChangeAdmin(newAdmin){
        dispatch(setAdmin(newAdmin));
        dispatch(fetchOrgsThunk(newAdmin));
      },
      onAddAdmin(newAdmin){
        dispatch(fetchAdminsThunk(newAdmin));
        dispatch(fetchOrgsThunk(newAdmin));
      },
      onAddElevatedAdmin(){
        dispatch(fetchElevatedAdminsThunk())
      },
      resetOrgs(){
        dispatch(fetchOrgs([]));
        dispatch(setIsAdminThunk(true, firebase.auth().currentUser.email));
      },
      onAddOrg(){
        dispatch(fetchAllOrgsThunk())
      }
    }
  }

  export default connect(mapState, mapDispatch)(Admin);
