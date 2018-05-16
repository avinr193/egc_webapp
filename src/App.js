import React from 'react';
import ReactDOM from 'react-dom'
import './styles/App.css';
import { NavLink, Switch, Route, Redirect } from 'react-router-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FlatButton from 'material-ui/FlatButton';
import IconMenu from 'material-ui/IconMenu'
import IconButton from 'material-ui/IconButton'
import MenuItem from 'material-ui/MenuItem'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'

import Home from './pages/Home'
import About from './pages/About'
import Attendance from './pages/Attendance'
import Voting from './pages/Voting'
import Admin from './pages/Admin'

var firebase = require("firebase");

//custom classes
class SignInButton extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      label: "SIGN-IN",
      enabled: true
    }
  }

  componentDidMount() {
    this.editButton = ReactDOM.findDOMNode(this.refs.editButton)
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          enabled: false,
          label: user.displayName // update it here
        })
      } 
    });
  }

  signIn() {
    if(this.state.enabled){
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({
        'hd': 'scarletmail.rutgers.edu'
      });
      firebase.auth().signInWithRedirect(provider);
    }
  }

  signOut() {
    firebase.auth().signOut()
    .then(() => {
      this.setState({
        enabled: true,
        label: "SIGN-IN"
      });
    });
  }

  render() {
    return (
      (this.state.enabled ? 
        <div>
        <FlatButton onClick={() => this.signIn()} labelStyle={{color:"#FFFFFF"}} label={this.state.label} 
        backgroundColor="#F44336" hoverColor="#FFCDD2" rippleColor="#F44336"/>
        </div> :
        <div>
        <IconMenu 
        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        iconStyle={{color: "#FFFFFF"}}
        >
        <MenuItem onClick={() => this.signOut()} primaryText="Sign out" />
        <MenuItem primaryText="Close"/>
        </IconMenu>
        </div>)
      )
  }
}

// Initialize Firebase
var config = {
  apiKey: "AIzaSyARArmmao9OmVsDjXHM-lUdZM7wm66AhYc",
  authDomain: "egc-webapp.firebaseapp.com",
  databaseURL: "https://egc-webapp.firebaseio.com",
  projectId: "egc-webapp",
  storageBucket: "egc-webapp.appspot.com",
  messagingSenderId: "1010814884629"
};
firebase.initializeApp(config);

firebase.auth().getRedirectResult().then(function(result) {
  if (result.credential) {
  // This gives you a Google Access Token. You can use it to access the Google API.
  //var token = result.credential.accessToken;
}
}).catch(function(error) {
// Handle Errors here.
/*
var errorCode = error.code;
var errorMessage = error.message;
// The email of the user's account used.
var email = error.email;
// The firebase.auth.AuthCredential type that was used.
var credential = error.credential;
// ...
*/
});

const App = () => (
  <MuiThemeProvider>
  <div className='app'>
  <Navigation />
  <Main />
  </div>
  </MuiThemeProvider>
  );

const Navigation = () => (
  <nav>
  <ul id="paginate">
  <li style={{padding:5}}><NavLink exact to='/home'><img style={{height:"90%", width:"100%"}} src={require('./egc.png')} alt="egc logo"/></NavLink></li>
  <li><NavLink exact activeClassName="current" to='/attendance'>Attendance</NavLink></li>
  <li><NavLink exact activeClassName="current" to='/voting'>Voting</NavLink></li>
  <li><NavLink exact activeClassName="current" to='/admin'>Admin</NavLink></li>
  <li><NavLink exact activeClassName="current" to='/about'>About</NavLink></li>
  <li>
  <SignInButton />
  </li>
  </ul>
  </nav>
  );

const Main = () => (
  <Switch>
  <Route exact path='/home' component={Home}></Route>
  <Route exact path='/about' component={About}></Route>
  <Route exact path='/attendance' component={Attendance}></Route>
  <Route exact path='/voting' component={Voting}></Route>
  <Route exact path='/admin' component={Admin}></Route>

  <Redirect exact from="*" to="/attendance"/>
  </Switch>
  );

export default App;
