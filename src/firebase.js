import firebase from 'firebase/app'
import 'firebase/database'
import uuid from 'uuid/v4'
import config from './config'

firebase.initializeApp(config);

export default firebase;

export const database = firebase.database();

export function isGeneralAdmin(name, email) {
    let isGeneralAdmin = false;
    return database.ref('/Admins/general/').once('value', snap => {
        isGeneralAdmin = snap.hasChild(name);
        if (isGeneralAdmin) { isGeneralAdmin = (snap.child(name).val() === email) };
    }).then(() => { return isGeneralAdmin; })
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

export const addAtt = (currentDate, currentEvent, displayName, timestamp, email, userLat, userLong, distToEvent, attPath, uid) => {
    database.ref(`/Organizations/Engineering Governing Council/2018/events/${currentEvent}/${currentDate}/attendance/${attPath}/people`)
        .child(uid).set({
            time_logged: timestamp,
            email: email,
            location: { latitude: userLat, longitude: userLong, distance: distToEvent },
            name: displayName
        })
}

export const logOption = (livePoll, option, user, timestamp, userLat, userLong, distToEvent) => {
    database.ref(`/Organizations/${livePoll.organization}/2018/polls/${livePoll.uuid}/people/`)
        .child(user.uid).set({
            time_logged: timestamp,
            email: user.email,
            location: { latitude: userLat, longitude: userLong, distance: distToEvent },
            name: user.displayName,
            option: option
        })
}

export const addEvent = (currentOrganization, year, date, timeStart, timeEnd, name,
    eventLat = 1, eventLong = 1, radius = 1, closingAtt = false) => {
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

export const addPoll = (currentOrganization, year, question, options, pollLat, pollLong, radius) => {
    const id = uuid();
    database.ref(`/Organizations/${currentOrganization}/${year}/polls/${id}/`).set({
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