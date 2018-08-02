import firebase from '../firebase'

const database = firebase.database();

export const ActionTypes = {
    FETCH_ORGS: "FETCH_ORGS",
    FETCH_EVENTS: "FETCH_EVENTS",
    FETCH_DATE: "FETCH_DATE",
    FETCH_ATT: "FETCH_ATT",
    FETCH_USER: "FETCH_USER",
    SET_EVENT: "SET_EVENT"
}

/*ACTION CREATORS*/
export const fetchEvents = (events) => ({type: ActionTypes.FETCH_EVENTS, events})
export const fetchAtt = (attendance) => ({type: ActionTypes.FETCH_ATT, attendance})
export const fetchDate = (date) => ({type:ActionTypes.FETCH_DATE, date})
export const setEvent = (newEvent) => ({type:ActionTypes.SET_EVENT, newEvent})

/*THUNKS*/
export function fetchDateThunk () {
    return dispatch => {
        var today = new Date(); 
        var currentDate = (today.getMonth()+1).toString() + "-" + today.getDate().toString();
        dispatch(fetchDate(currentDate));
    }
}

export function fetchEventsThunk () {
    return dispatch => {
    const events = [];
    database.ref(`/Engineering Governing Council/`).once('value', snap => {
     snap.forEach(data => {
     for (var event in data.val()){
        events.push(event)
     }
     })
    })
    .then(() => dispatch(fetchEvents(events)))
    .then(() => dispatch(setEvent(events[0])))
    }
}

export function fetchAttendanceThunk () {
    return (dispatch,getState) => {
        var state = getState();
        const attendance = [];
        database.ref(`/Engineering Governing Council/2018/${state.currentEvent}/${state.currentDate}/attendance/people`).once('value', snap => {
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
    }
}

/*LISTENERS*/
export function watchEventAdded (dispatch) {
    return dispatch => {
    database.ref(`/Engineering Governing Council/2018/`).on('child_added', (snap) => {    
        dispatch(fetchEventsThunk());
    });
    }
}

export function watchAttendanceAdded (dispatch) {
    return dispatch => {
    database.ref(`/Engineering Governing Council/2018/`).on('child_changed', (snap) => {    
        dispatch(fetchAttendanceThunk());
    });
    }
}