import firebase from 'firebase/app'
import 'firebase/database'
import uuid from 'uuid/v4'
import config from './config'

firebase.initializeApp(config);

export default firebase;

export const database = firebase.database();

export function isGeneralAdmin(email) {
    let netID = email.split('@')[0];
    let isGeneralAdmin = false;
    return database.ref('/Admins/').once('value', snap => {
        isGeneralAdmin = snap.hasChild(netID);
    }).then(() => { return isGeneralAdmin; })
}

export function isSpecificAdmin(email) {
    let netID = email.split('@')[0];
    let isSpecificAdmin = false;
    return database.ref('/Admins/').once('value', snap => {
        isSpecificAdmin = snap.hasChild(netID);
    }).then(() => { 
        isSpecificAdmin = (netID === "nbb29" || netID === "sss309" || netID === "aja193")
        return isSpecificAdmin; })
}

export const currentUser = () => {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          return user;
        } else {
          return null;
        }
      });
}

export function signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
        'hd': 'scarletmail.rutgers.edu'
    });
    firebase.auth().signInWithRedirect(provider);
}

export function signOut() {
    firebase.auth().signOut()
}

//from https://itnext.io/hooking-up-firebase-to-your-redux-store-a5e799cf84c4
export const addTaskToFirebase = (task) => {
    const id = uuid()
    database.ref(`/${id}`).set({
        task, id
    })
}

export const deleteAdminOrg = (admin, e) => {
    database.ref(`/Admins/${admin}/`).child(e.currentTarget.value).remove();
}

export const deleteEventDate = (currentOrg, currentYear, currentEvent, eventDate, user) => {
    let today = new Date();
    database.ref(`/Organizations/${currentOrg}/${currentYear}/events/${currentEvent}/${eventDate.key}/`).remove();
    database.ref(`/deletions/events/${user.email.split('@')[0]}`).child(`${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}-${today.getMilliseconds()}-${today.getMonth()+1}-${today.getDate()}-${today.getFullYear()}`)
    .update({
        organization: currentOrg,
        year: currentYear,
        event: currentEvent,
        date: eventDate
    });
}

export const deletePoll = (currentYear, currentPoll, user) => {
    let today = new Date();
    database.ref(`/Organizations/${currentPoll.organization}/${currentYear}/polls/${currentPoll.uuid}/`).remove();
    database.ref(`/deletions/polls/${user.email.split('@')[0]}`).child(`${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}-${today.getMilliseconds()}-${today.getMonth()+1}-${today.getDate()}-${today.getFullYear()}`)
    .update({
        organization: currentPoll.organization,
        year: currentYear,
        poll: currentPoll
    })
}

export const addAtt = (currentOrg, currentDate, currentEvent, displayName, timestamp, email, 
    userLat, userLong, distToEvent, attPath, uid, currentYear) => {
    database.ref(`/Organizations/${currentOrg}/${currentYear}/events/${currentEvent}/${currentDate}/attendance/${attPath}/people`)
        .child(uid).set({
            time_logged: timestamp,
            email: email,
            location: { latitude: userLat, longitude: userLong, distance: distToEvent },
            name: displayName
        })
}

export const addOrg = (newOrg, year) => {
    database.ref('/Organizations/').child(newOrg).child(year).set({
        events: 'null',
        polls: 'null',
        dummy: 'null'
    });
}

export const addAdminOrg = (newOrg, admin) => {
    database.ref(`/Admins/${admin}`).update({
        [newOrg]: newOrg.match(/\b(\w)/g).join(''),
    });
}

export const addAdmin = (admin) => {
    database.ref(`/Admins/`).update({
        [admin]: 'null',
    });
}

export const logOption = (livePoll, option, user, timestamp, userLat, userLong, distToEvent,
    currentYear) => {
    database.ref(`/Organizations/${livePoll.organization}/${currentYear}/polls/${livePoll.uuid}/people/`)
        .child(user.uid).set({
            time_logged: timestamp,
            email: user.email,
            location: { latitude: userLat, longitude: userLong, distance: distToEvent },
            name: user.displayName.toUpperCase(),
            option: option
        })
}

export const addEvent = (currentOrganization, year, date, timeStart, timeEnd, name,
    eventLat = 1, eventLong = 1, radius = 1, closingAtt = false) => {
    let today = new Date();
    let currentYear = today.getFullYear().toString();
    if(year !== currentYear){
        return;
    }
    database.ref(`/Organizations/${currentOrganization}/${year}/events/${name}/${date}/`)
        .child("properties").set({
            time_start: timeStart,
            time_end: timeEnd,
            location: { latitude: eventLat, longitude: eventLong, radius: radius },
            organization: currentOrganization,
            date: date,
            year: year,
            closingAtt: closingAtt
        })
}

export const addPoll = (currentOrganization, currentYear, question, options, pollLat, pollLong, radius) => {
    const id = uuid();
    let today = new Date();
    let year = today.getFullYear().toString();
    if(year !== currentYear){
        return;
    }
    database.ref(`/Organizations/${currentOrganization}/${currentYear}/polls/${id}/`).set({
        question: question,
        options: options,
        properties: {
            location: { latitude: pollLat, longitude: pollLong, radius: radius },
            organization: currentOrganization
        }
    })
    return id;
}

export function isLiveEvent(liveEventString, attPath) {
    if(!(liveEventString && attPath)){
        liveEventString = 'null';
        attPath = 'null';
    }
    let isLive = false;
    return database.ref('/liveEvents/').once('value', snap => {
        isLive = snap.hasChild(liveEventString);
        if (isLive) { isLive = (snap.child(liveEventString).val().attPath === attPath) };
    }).then(() => { return isLive; })
}

export function isLivePoll(livePollID) {
    if(!livePollID){
        livePollID = 'null';
    }
    let isLive = false;
    return database.ref('/livePolls/').once('value', snap => {
        isLive = snap.hasChild(livePollID);
    }).then(() => { return isLive; })
}

export function addLiveEvent(liveEvent) {
    let liveEventString = liveEvent.date + liveEvent.event + liveEvent.organization;
    database.ref(`/liveEvents/`).child(liveEventString).set(liveEvent);
}

export function removeLiveEvent(liveEvent) {
    let liveEventString = liveEvent.date + liveEvent.event + liveEvent.organization;
    database.ref(`/liveEvents/`).child(liveEventString).remove();
}

export function addLivePoll(livePoll) {
    database.ref('/livePolls/').child(livePoll.uuid).set(livePoll);
}

export function removeLivePoll(livePoll) {
    database.ref('/livePolls/').child(livePoll.uuid).remove();
}

export const removeTaskFromFirebase = (id) => {
    database.ref(`/${id}`).remove()
}