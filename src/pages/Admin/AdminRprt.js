import React from 'react'

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
      currentEvent: "sample_EGC_Meeting",
      user: null,
      event_list: [],
      att_list: []
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

    var master = this;


    var database = firebase.database().ref();
    database.on('value', function(datasnapshot) {
    	var events = [];
    	for (var key in datasnapshot.toJSON()){
    		const eventObj = {
    			event: key
    		}
    		events.push(eventObj);
    	}
    	master.setState({
  			event_list: events
  		})
    });

  	var event = firebase.database().ref().child(this.state.currentEvent).child("attendance");
  	event.on('value', function(datasnapshot) {
  		var names = [];
  		var dataArr = datasnapshot.toJSON();
  		for (var key in dataArr){
  			const attObj = {
  				name: key.toUpperCase(),
  				email: (dataArr[key]).EMAIL,
  				time: (dataArr[key]).TIME_SUCCESS.toString()
  			}
    		names.push(attObj);
  		}
  		master.setState({
  			att_list: names
  		})
  	});
  }

changeEvent(event, index, value){
	firebase.database().ref().child(this.state.currentEvent).child("attendance").off('value');
  	this.setState({
  		currentEvent: value,
  		att_list: []
  	}, function () {
  		var master = this;
  		var event = firebase.database().ref().child(this.state.currentEvent).child("attendance");
  		event.off();
  	event.on('value', function(datasnapshot) {
  		var names = [];
  		var dataArr = datasnapshot.toJSON();
  		for (var key in dataArr){
  			const attObj = {
  				name: key.toUpperCase(),
  				email: (dataArr[key]).EMAIL,
  				time: (dataArr[key]).TIME_SUCCESS.toString()
  			}
    		names.push(attObj);
  		}
  		master.setState({
  			att_list: names
  		})});
  	})
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