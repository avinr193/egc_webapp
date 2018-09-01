import React from 'react'

import 'firebase/auth'
import firebase from '../../firebase'

const Admin = () => (
	<div className = "admin">
		<AdminRprtWindow />
    </div>
);

export default Admin

class AdminRprtWindow extends React.Component {
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
      }
      else {
      	this.setState({
          enabled: false,
          user: null
        })
      }
		 });
		}

  render() {

    return (
      (!this.state.enabled ?
        <div>
         	<p>Please sign-in with an admin-enabled account!</p>
          	<p style = {{color:"#DAA520"}}>If sign-in button doesn't work, make sure pop-ups are enabled and try again</p>
          	<p style = {{color:"#DAA520"}}>(wait a few seconds after returning from sign-in page for this screen to refresh)</p>
        </div> 
        : 
        <div>
            <div>Report Generation</div>
        </div>
      )
    )
  }
}