import firebase, { isLiveEvent, isLivePoll } from '../firebase'

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
    SET_IS_EVENT_LIVE: "SET_IS_EVENT_LIVE",
    SET_ATT_PATH: "SET_ATT_PATH",
    FETCH_POLLS: "FETCH_POLLS",
    SET_POLL: "SET_POLL",
    SET_IS_POLL_LIVE: "SET_IS_POLL_LIVE",
    FETCH_LIVE_POLLS: "FETCH_LIVE_POLLS",
    SET_LIVE_POLL: "SET_LIVE_POLL"
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
export const fetchLivePolls= (livePolls) => ({type:ActionTypes.FETCH_LIVE_POLLS, livePolls})
export const setLivePoll = (newLivePoll) => ({type:ActionTypes.SET_LIVE_POLL, newLivePoll})
export const setIsEventLive = (isEventLive) => ({type:ActionTypes.SET_IS_EVENT_LIVE, isEventLive})
export const setIsPollLive = (isPollLive) => ({type:ActionTypes.SET_IS_POLL_LIVE, isPollLive})
export const setAttPath = (newAttPath) => ({type:ActionTypes.SET_ATT_PATH, newAttPath})
export const fetchPolls = (polls) => ({type: ActionTypes.FETCH_POLLS, polls})
export const setPoll = (poll) => ({type: ActionTypes.SET_POLL, poll})

/*THUNKS*/
export function fetchDateThunk () {
    return dispatch => {
        let today = new Date(); 
        let currentDate = (today.getMonth()+1).toString() + "-" + today.getDate().toString();
        dispatch(fetchDate(currentDate));
    }
}

export function checkEventLive () {
    return (dispatch, getState) => {
        let state = getState();
        if(!state.currentEvent){return;};
        isLiveEvent(state.currentDate+state.currentEvent+state.currentOrg, state.attPath)
        .then((isEventLive) => dispatch(setIsEventLive(isEventLive)));
    }
}

export function checkPollLive () {
    return (dispatch, getState) => {
        let state = getState();
        if(!state.currentPoll){return;};
        isLivePoll(state.currentPoll.uuid).then((isPollLive)=>dispatch(setIsPollLive(isPollLive)));
    }
}

export function fetchEventDatesThunk () {
    return (dispatch, getState) => {
        let state = getState();
        const eventDates = [];
        database.ref(`/Organizations/Engineering Governing Council/2018/events/${state.currentEvent}/`).once('value', snap => {
            snap.forEach(data => {
                const eventDate = {
                    key: data.key,
                    props: data.val().properties ? data.val().properties : null
                }
               eventDates.push(eventDate)
            })
           })
        .then(() => dispatch(fetchEventDates(eventDates)))
        .then(() => dispatch(setEventDate(eventDates[eventDates.length-1])))
        .then(() => dispatch(fetchAttendanceThunk()))
    }
}

export function fetchEventsThunk () {
    return (dispatch) => {
    let events = [];
    database.ref(`/Organizations/Engineering Governing Council/2018/events/`).once('value', snap => {
     snap.forEach(data => {
        events.push(data.key)
     })
    })
    .then(() => dispatch(fetchEvents(events)))
    .then(() => events[0] ? dispatch(setEvent(events[0])) : null)
    .then(() => dispatch(fetchEventDatesThunk()))
    .then(() => dispatch(fetchPollsThunk()))
    }
}

export function fetchPollsThunk () {
    return (dispatch, getState) => {
        let state = getState();
        let polls = [];
        database.ref(`/Organizations/${state.currentOrg}/2018/polls/`).once('value', snap => {
            snap.forEach(data => {
                const pollObj = {
                    question: data.val().question,
                    options: data.val().options,
                    organization: data.val().properties.organization,
                    location: data.val().properties.location,
                    uuid: data.key
                }
                polls.push(pollObj);
            })
        })
        .then(() => dispatch(fetchPolls(polls)))
        .then(() => {
            if(state.currentPoll.question !== ''){
                return polls.filter(obj => {
                    return obj.question === state.currentPoll.question;
                  })[0]
            }
            else{
                return null;
            }})
        .then((newPoll) => (polls[0]) ? (newPoll ? dispatch(setPoll(newPoll)) : dispatch(setPoll(polls[0]))) : null)
        .then(() => polls[0] ? dispatch(checkPollLive()) : null)
    }
}

export function updatePollCounts () {
    return (dispatch, getState) => {
        let state = getState();
        database.ref('/livePolls/').once('value', snap => {
            snap.forEach(data => {
                database.ref(`/Organizations/${state.currentOrg}/2018/polls/${data.key}/options/`).once('value', snap => {
                    let options = snap.val();
                    for (let key in options){
                        options[key].count = 0;
                    }
                    database.ref(`/Organizations/${state.currentOrg}/2018/polls/${data.key}/people/`).once('value', snap => {
                        snap.forEach(data => {
                            options.filter(obj => {return obj.text === data.val().option})[0].count += 1;
                        })
                    })
                database.ref(`/Organizations/${state.currentOrg}/2018/polls/${data.key}/options/`).set(options);
                })
            })
        })
        .then((() => dispatch(fetchPollsThunk())));
    }
}

export function fetchOrgsThunk () {
    return dispatch => {
    let organizations = [];
    database.ref(`/Organizations/`).once('value', snap => {
     snap.forEach(data => {
        organizations.push(data.key)
     })
    })
    .then(() => dispatch(fetchOrgs(organizations)))
    .then(() => organizations[0] ? dispatch(setOrg(organizations[0])) : null)
    .then(() => dispatch(fetchEventsThunk()))
    }
}

export function fetchAttendanceThunk () {
    return (dispatch,getState) => {
        let state = getState();
        let attendance = [];
        database.ref(`/Organizations/Engineering Governing Council/2018/events/${state.currentEvent}/${state.eventDate.key}/attendance/${state.attPath}/people`).once('value', snap => {
        snap.forEach(data => {
            const attObj = {
                name: data.val().name.toUpperCase(),
                email: data.val().email,
                time: data.val().time_logged.toString()
            }
            attendance.push(attObj);
        })
        })
        .then(() => dispatch(fetchAtt(attendance)))
        .then(() => dispatch(checkEventLive()))
    }
}

export function fetchLiveEventsThunk () {
    return (dispatch) => {
        let liveEvents = [];
        database.ref(`/liveEvents/`).once('value', snap => {
            snap.forEach(data => {
               liveEvents.push(data.val())
            })
        })
        .then(() => dispatch(fetchLiveEvents(liveEvents)))
        .then(() => liveEvents[0] ? dispatch(setLiveEvent(liveEvents[0])) : null)
        .then(() => liveEvents[0] ? dispatch(checkEventLive()) : null)
    }
}

export function fetchLivePollsThunk () {
    return (dispatch) => {
        let livePolls = [];
        database.ref(`/livePolls/`).once('value', snap => {
            snap.forEach(data => {
               livePolls.push(data.val())
            })
        })
        .then(() => dispatch(fetchLivePolls(livePolls)))
        .then(() => livePolls[0] ? dispatch(setLivePoll(livePolls[0])) : null)
        .then(() => livePolls[0] ? dispatch(checkPollLive()) : null)
    }
}

/*LISTENERS*/
export function watchEventAdded () {
    return dispatch => {
    database.ref(`/Organizations/Engineering Governing Council/2018/events/`).on('child_added', () => {    
        dispatch(fetchEventsThunk());
    });
    }
}

export function watchAttendanceAdded () {
    return dispatch => {
    database.ref(`/Organizations/Engineering Governing Council/2018/events/`).on('child_added', () => {    
        dispatch(fetchAttendanceThunk());
    });
    database.ref(`/Organizations/Engineering Governing Council/2018/events/`).on('child_changed', () => {    
        dispatch(fetchAttendanceThunk());
    });
    }
}

export function watchEventDateAdded () {
    return dispatch => {
    database.ref(`/Organizations/Engineering Governing Council/2018/events/GENERAL COUNCIL/`).on('child_added', () => {    
        dispatch(fetchEventDatesThunk());
    });
    }
}

export function watchLiveEvents () {
    return dispatch => {
    database.ref(`/liveEvents/`).on('child_added', () => {    
        dispatch(fetchLiveEventsThunk());
    });
    database.ref(`/liveEvents/`).on('child_removed', () => {    
        dispatch(fetchLiveEventsThunk());
    });
    }
}

export function watchPollAdded () {
    return dispatch => {
        database.ref(`/Organizations/Engineering Governing Council/2018/polls/`).on('child_added', () => {    
            dispatch(updatePollCounts());
        });
        database.ref(`/Organizations/Engineering Governing Council/2018/polls/`).on('child_changed', () => {    
            dispatch(updatePollCounts());
        });
    }
}

export function watchLivePolls () {
    return dispatch => {
    database.ref(`/livePolls/`).on('child_added', () => {    
       dispatch(fetchLivePollsThunk());
    });
    database.ref(`/livePolls/`).on('child_removed', () => {    
       dispatch(fetchLivePollsThunk());
    });
    }
}
