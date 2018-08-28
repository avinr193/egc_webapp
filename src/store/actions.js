import firebase, { isLiveEvent } from '../firebase'

const database = firebase.database();

export const ActionTypes = {
    FETCH_ORGS: "FETCH_ORGS",
    FETCH_EVENTS: "FETCH_EVENTS",
    FETCH_DATE: "FETCH_DATE",
    FETCH_ATT: "FETCH_ATT",
    FETCH_USER: "FETCH_USER",
    SET_EVENT: "SET_EVENT",
    SET_ORG: "SET_ORG",
    FETCH_EVENT_DATES: "FETCH_EVENT_DATES",
    SET_EVENT_DATE: "SET_EVENT_DATE",
    FETCH_LIVE_EVENTS: "FETCH_LIVE_EVENTS",
    SET_LIVE_EVENT: "SET_LIVE_EVENT",
    SET_IS_EVENT_LIVE: "SET_IS_EVENT_LIVE"
}

/*ACTION CREATORS*/
export const fetchEvents = (events) => ({type: ActionTypes.FETCH_EVENTS, events})
export const fetchOrgs = (organizations) => ({type: ActionTypes.FETCH_ORGS, organizations})
export const fetchAtt = (attendance) => ({type: ActionTypes.FETCH_ATT, attendance})
export const fetchEventDates = (eventDates) => ({type: ActionTypes.FETCH_EVENT_DATES, eventDates})
export const setEventDate = (eventDate) => ({type: ActionTypes.SET_EVENT_DATE, eventDate})
export const fetchDate = (date) => ({type:ActionTypes.FETCH_DATE, date})
export const setEvent = (newEvent) => ({type:ActionTypes.SET_EVENT, newEvent})
export const setOrg = (newOrg) => ({type:ActionTypes.SET_ORG, newOrg})
export const fetchLiveEvents = (liveEvents) => ({type:ActionTypes.FETCH_LIVE_EVENTS, liveEvents})
export const setLiveEvent = (newLiveEvent) => ({type:ActionTypes.SET_LIVE_EVENT, newLiveEvent})
export const setIsEventLive = (isEventLive) => ({type:ActionTypes.SET_IS_EVENT_LIVE, isEventLive})

/*THUNKS*/
export function fetchDateThunk () {
    return dispatch => {
        var today = new Date(); 
        var currentDate = (today.getMonth()+1).toString() + "-" + today.getDate().toString();
        dispatch(fetchDate(currentDate));
    }
}

export function checkEventLive (attPath="opening") {
    return (dispatch, getState) => {
        let state = getState();
        let isEventLive = isLiveEvent(state.currentDate+state.currentEvent+state.currentOrg, attPath);
        dispatch(setIsEventLive(isEventLive));
    }
}

export function fetchEventDatesThunk (attPath="opening") {
    return (dispatch, getState) => {
        var state = getState();
        const eventDates = [];
        database.ref(`/Engineering Governing Council/2018/events/${state.currentEvent}/`).once('value', snap => {
            snap.forEach(data => {
                var eventDate = {
                    key: data.key,
                    props: data.val().properties ? data.val().properties : null
                }
               eventDates.push(eventDate)
            })
           })
        .then(() => dispatch(fetchEventDates(eventDates)))
        .then(() => dispatch(setEventDate(eventDates[eventDates.length-1])))
        .then(() => dispatch(fetchAttendanceThunk(attPath)))
        .then(() => dispatch(setIsEventLive(isLiveEvent(state.currentDate+state.currentEvent+state.currentOrg))))
    }
}

export function fetchEventsThunk () {
    return dispatch => {
    const events = [];
    database.ref(`/Engineering Governing Council/2018/`).once('value', snap => {
     snap.forEach(data => {
     for (var event in data.val()){
        events.push(event)
     }
     })
    })
    .then(() => dispatch(fetchEvents(events)))
    .then(events[0] ? () => dispatch(setEvent(events[0])) : null)
    .then(() => dispatch(fetchEventDatesThunk()))
    }
}

export function fetchOrgsThunk () {
    return dispatch => {
    const organizations = [];
    database.ref(`/`).once('value', snap => {
     snap.forEach(data => {
        organizations.push(data.key)
     })
    })
    .then(() => dispatch(fetchOrgs(organizations)))
    .then(() => dispatch(setOrg(organizations[0])))
    .then(() => dispatch(fetchEventsThunk()))
    }
}

export function fetchAttendanceThunk (attPath="opening") {
    return (dispatch,getState) => {
        var state = getState();
        const attendance = [];
        database.ref(`/Engineering Governing Council/2018/events/${state.currentEvent}/${state.eventDate.key}/attendance/${attPath}/people`).once('value', snap => {
        snap.forEach(data => {
            const attObj = {
                name: data.key.toUpperCase(),
                email: data.val().email,
                time: data.val().time_logged.toString()
            }
            attendance.push(attObj);
        })
        })
        .then(() => dispatch(fetchAtt(attendance)))
        .then(() => dispatch(setIsEventLive(isLiveEvent(state.currentDate+state.currentEvent+state.currentOrg, attPath))))
    }
}

export function fetchLiveEventsThunk () {
    return (dispatch) => {
        const liveEvents = [];
        database.ref(`/liveEvents/`).once('value', snap => {
            snap.forEach(data => {
               liveEvents.push(data.val())
            })
        })
        .then(() => dispatch(fetchLiveEvents(liveEvents)))
        .then(liveEvents[0] ? () => dispatch(setLiveEvent(liveEvents[0])) : null)
    }
}

/*LISTENERS*/
export function watchEventAdded () {
    return dispatch => {
    database.ref(`/Engineering Governing Council/2018/events/`).on('child_added', () => {    
        dispatch(fetchEventsThunk());
    });
    }
}

export function watchAttendanceAdded () {
    return dispatch => {
    database.ref(`/Engineering Governing Council/2018/events/`).on('child_added', () => {    
        dispatch(fetchAttendanceThunk());
    });
    database.ref(`/Engineering Governing Council/2018/events/`).on('child_changed', () => {    
        dispatch(fetchAttendanceThunk());
    });
    }
}

export function watchEventDateAdded () {
    return dispatch => {
    database.ref(`/Engineering Governing Council/2018/events/GENERAL COUNCIL/`).on('child_added', () => {    
        dispatch(fetchEventDatesThunk());
    });
    }
}

export function watchLiveEvents () {
    return dispatch => {
    database.ref(`/liveEvents/`).on('child_added', () => {    
        dispatch(fetchLiveEventsThunk());
        dispatch(fetchEventsThunk());
    });
    database.ref(`/liveEvents/`).on('child_removed', () => {    
        dispatch(fetchLiveEventsThunk());
        dispatch(fetchEventsThunk());
    });
    }
}

