import React from 'react'
import { connect } from 'react-redux'
import 'firebase/auth'
import firebase, { signIn, isSpecificAdmin, addOrg, addAdminOrg, addAdmin } from '../../firebase'

import FlatButton from 'material-ui/FlatButton';
import { List, ListItem } from 'material-ui/List';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';

import { setIsAdminThunk, fetchAllOrgsThunk, fetchAdminsThunk, setAdmin, fetchOrgsThunk, fetchOrgs } from '../../store/actions'

const Admin = ({onIsAdmin, isAdmin, orgs, currentYear, admins, currentAdmin, onChangeAdmin, allOrgs, 
  resetOrgs, onAddOrg, onAddAdmin}) => (
	<div className = "admin">
    <AdminAdOrgsWindow onIsAdmin={onIsAdmin} isAdmin={isAdmin} orgs={orgs} 
    currentYear={currentYear} admins={admins} currentAdmin={currentAdmin}
    onChangeAdmin={onChangeAdmin} allOrgs={allOrgs} resetOrgs={resetOrgs} onAddOrg={onAddOrg}
    onAddAdmin={onAddAdmin}/>
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
      newAdminName: ''
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

  render() {

    let allOrgsList = [];
		for (let j = 0; j < this.props.allOrgs.length; j++) {
			allOrgsList.push(<ListItem key={j} value={this.props.allOrgs[j]} primaryText={this.props.allOrgs[j]}></ListItem>);
    }
    
    let adminsList = [];
    for (let k = 0; k < this.props.admins.length; k++) {
    		adminsList.push(<MenuItem key={k} value={this.props.admins[k]} primaryText={this.props.admins[k]}></MenuItem>);
    }

    let orgsList = [];
		for (let j = 0; j < this.props.orgs.length; j++) {
			orgsList.push(<ListItem key={j} value={this.props.orgs[j]} primaryText={this.props.orgs[j]}></ListItem>);
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
            <div style={{ "fontWeight": "bold" }}>Organizations</div>
            <List style={{"maxHeight":"52%", "overflow":"scroll"}}>
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
            <DropDownMenu maxHeight={300} value={this.props.currentAdmin} onChange={this.changeAdmin.bind(this)}>
            	{adminsList}
          	</DropDownMenu>
            <div></div>
            <TextField name="newAdmin" value={this.state.newAdminName} onChange={(e) => this.setNewAdminName(e)}
				    hintText="e.g. Rutgers Red Club" floatingLabelText={"Add Admin (enter netID, e.g. ru098)"} key={3} style={{ "marginTop": "0px" }} />
            <div style={{"padding":"5px"}}></div>
            <FlatButton onClick={() => {this.checkAdmin()}} labelStyle={{ color: "#FFFFFF" }} label={"Submit"}
						backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336" />
            <div style={{"color":"red","padding":"25px"}}>{this.state.addAdminError}</div>
            <div style={{"fontWeight":"bold"}}>Accessible Organizations</div>
            <List style={{"maxHeight":"20.3%", "overflow":"scroll"}}>
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
        : <div>You are not an admin.</div>)
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
    currentAdmin: state.currentAdmin
  })
  const mapDispatch = (dispatch) => {
    dispatch(fetchAllOrgsThunk());
    dispatch(fetchAdminsThunk());
    return {
      onIsAdmin(isGenAdmin, email){
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
