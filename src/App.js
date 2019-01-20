import React from 'react';
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import firebase from './firebase'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Main from './components/Main'
import Navigation from './components/Navigation'

import { fetchDateThunk,
  watchLiveEvents,
  watchLivePolls} from './store/actions'

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
  <div className='app' style={{"overflow":"hidden"}}>
  <Navigation/>
  <div style={{"marginTop":"75px"}}>
  <Main/>
  </div>
  </div>
  </MuiThemeProvider>
);

const mapState = () => {
  return {};
}
 const mapDispatch = dispatch => {
  dispatch(fetchDateThunk())
  dispatch(watchLiveEvents())
  dispatch(watchLivePolls())
  return {
  }
}

export default withRouter(connect(mapState, mapDispatch)(App));
