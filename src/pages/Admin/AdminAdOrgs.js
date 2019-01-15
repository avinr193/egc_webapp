import React from 'react'
import { connect } from 'react-redux'
import 'firebase/auth'
import firebase, { signIn, isGeneralAdmin } from '../../firebase'

import FlatButton from 'material-ui/FlatButton';
import { List, ListItem } from 'material-ui/List';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

import { setIsAdminThunk, fetchAllOrgsThunk, fetchAdminsThunk, setAdmin, fetchOrgsThunk } from '../../store/actions'

const Admin = ({onIsAdmin, isAdmin, orgs, currentYear, admins, currentAdmin, onChangeAdmin, allOrgs}) => (
	<div className = "admin">
    <AdminAdOrgsWindow onIsAdmin={onIsAdmin} isAdmin={isAdmin} orgs={orgs} 
    currentYear={currentYear} admins={admins} currentAdmin={currentAdmin}
    onChangeAdmin={onChangeAdmin} allOrgs={allOrgs}/>
    </div>
);

class AdminAdOrgsWindow extends React.Component {
	constructor(props){
    super(props);
    this.state = {
      enabled: false,
      user: null
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
    
    changeAdmin(event, index, value) {
      if (value) {
        this.props.onChangeAdmin(value);
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
            <List>
							{allOrgsList}
						</List>
            </div>
            <div style={{"flex":"1"}}>
            <div style={{ "fontWeight": "bold" }}>Admins</div>
            <DropDownMenu maxHeight={300} value={this.props.currentAdmin} onChange={this.changeAdmin.bind(this)}>
            	{adminsList}
          	</DropDownMenu>
            <List>
							{orgsList}
						</List>
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
      }
    }
  }

  export default connect(mapState, mapDispatch)(Admin);
