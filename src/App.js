import React from 'react';
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import firebase from './firebase'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Main from './components/Main'
import Navigation from './components/Navigation'

import { fetchEventsThunk, fetchAttendanceThunk, watchEventAdded, watchAttendanceAdded, fetchDateThunk } from './store/actions'

import './styles/App.css';

firebase.auth().getRedirectResult().then(function(result) {
  if (result.credential) {
    //var token = result.credential.accessToken; //google access token
}
}).catch(function(error) {

  //var errorCode = error.code;
  //var errorMessage = error.message;
  //console.log("Firebase error #" + error.code + " message: " + error.message);
});

//main code
const App = () => (
  <MuiThemeProvider>
  <div className='app'>
  <Navigation />
  <Main/>
  </div>
  </MuiThemeProvider>
);

const mapState = () => {
  return {};
}
 const mapDispatch = dispatch => {
  dispatch(fetchEventsThunk())
  dispatch(fetchAttendanceThunk())
  dispatch(fetchDateThunk())
  dispatch(watchEventAdded())
  dispatch(watchAttendanceAdded())
  return {
  }
}

export default withRouter(connect(mapState, mapDispatch)(App));
