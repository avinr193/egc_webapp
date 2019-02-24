import { database, isLiveEvent, isLivePoll } from '../firebase'

var sortBy = require('lodash/sortBy');

export const ActionTypes = {
    FETCH_ORGS: "FETCH_ORGS",
    FETCH_EVENTS: "FETCH_EVENTS",
    FETCH_DATE: "FETCH_DATE",
    FETCH_YEAR: "FETCH_YEAR",
    FETCH_YEARS: "FETCH_YEARS",
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
    SET_LIVE_POLL: "SET_LIVE_POLL",
    SET_IS_ADMIN: "SET_IS_ADMIN",
    SET_CURRENT_OPTION: "SET_CURRENT_OPTION",
    FETCH_ADMINS: "FETCH_ADMINS",
    SET_ADMIN: "SET_ADMIN",
    FETCH_ALL_ORGS: "FETCH_ALL_ORGS",
    SET_LOADING: "SET_LOADING",
    SET_IS_OPP_EVENT_LIVE: "SET_IS_OPP_EVENT_LIVE"
}

/*ACTION CREATORS*/
export const fetchEvents = (events) => ({ type: ActionTypes.FETCH_EVENTS, events })
export const fetchOrgs = (organizations) => ({ type: ActionTypes.FETCH_ORGS, organizations })
export const fetchAllOrgs = (allOrganizations) => ({ type: ActionTypes.FETCH_ALL_ORGS, allOrganizations })
export const fetchAtt = (attendance) => ({ type: ActionTypes.FETCH_ATT, attendance })
export const fetchEventDates = (eventDates) => ({ type: ActionTypes.FETCH_EVENT_DATES, eventDates })
export const setEventDate = (eventDate) => ({ type: ActionTypes.SET_EVENT_DATE, eventDate })
export const fetchDate = (date) => ({ type: ActionTypes.FETCH_DATE, date })
export const fetchYear = (year) => ({ type: ActionTypes.FETCH_YEAR, year })
export const fetchYears = (years) => ({ type: ActionTypes.FETCH_YEARS, years })
export const setEvent = (newEvent) => ({ type: ActionTypes.SET_EVENT, newEvent })
export const setOrg = (newOrg) => ({ type: ActionTypes.SET_ORG, newOrg })
export const fetchLiveEvents = (liveEvents) => ({ type: ActionTypes.FETCH_LIVE_EVENTS, liveEvents })
export const setLiveEvent = (newLiveEvent) => ({ type: ActionTypes.SET_LIVE_EVENT, newLiveEvent })
export const fetchLivePolls = (livePolls) => ({ type: ActionTypes.FETCH_LIVE_POLLS, livePolls })
export const setLivePoll = (newLivePoll) => ({ type: ActionTypes.SET_LIVE_POLL, newLivePoll })
export const setIsEventLive = (isEventLive) => ({ type: ActionTypes.SET_IS_EVENT_LIVE, isEventLive })
export const setIsOppEventLive = (isOppEventLive) => ({ type: ActionTypes.SET_IS_OPP_EVENT_LIVE, isOppEventLive })
export const setIsPollLive = (isPollLive) => ({ type: ActionTypes.SET_IS_POLL_LIVE, isPollLive })
export const setAttPath = (newAttPath) => ({ type: ActionTypes.SET_ATT_PATH, newAttPath })
export const fetchPolls = (polls) => ({ type: ActionTypes.FETCH_POLLS, polls })
export const setPoll = (poll) => ({ type: ActionTypes.SET_POLL, poll })
export const setIsAdmin = (isAdmin) => ({ type: ActionTypes.SET_IS_ADMIN, isAdmin })
export const setCurrentOption = (newOption) => ({ type: ActionTypes.SET_CURRENT_OPTION, newOption })
export const fetchAdmins = (admins) => ({ type: ActionTypes.FETCH_ADMINS, admins })
export const setAdmin = (newAdmin) => ({ type: ActionTypes.SET_ADMIN, newAdmin })
export const setLoading = (newLoading) => ({ type: ActionTypes.SET_LOADING, newLoading })

/*THUNKS*/
export function setIsAdminThunk(isAdmin, email=null) {
    let netID = null;
    if(email){
        netID = email.split('@')[0];
    }
    return (dispatch, getState) => {
        let state = getState();
        dispatch(setIsAdmin(isAdmin));
        if (isAdmin && state.organizations.length === 0) {
            dispatch(fetchOrgsThunk(netID));
        }
    }
}

export function fetchDateThunk() {
    return dispatch => {
        let today = new Date();
        let currentDate = (today.getMonth() + 1).toString() + "-" + today.getDate().toString();
        let currentYear = today.getFullYear().toString();
        dispatch(fetchDate(currentDate));
        dispatch(fetchYear(currentYear));
        dispatch(fetchYears([currentYear]));
    }
}

export function fetchAndSetPoll(id) {
    return (dispatch, getState) => {
        let state = getState();
        dispatch(fetchPollsThunk);
        database.ref(`/Organizations/${state.currentOrg}/${state.currentYear}/polls/`).child(id).once('value', snap => {
            dispatch(setPoll(snap.val()));
        })
    }
}

export function checkEventLive() {
    return (dispatch, getState) => {
        let state = getState();
        if (!state.currentEvent) { dispatch(setIsEventLive(false)); };
        let oppAttPath = state.attPath === "opening" ? "closing" : "opening";
        isLiveEvent(state.eventDate.key + state.currentEvent + state.currentOrg, state.attPath)
            .then((isEventLive) => dispatch(setIsEventLive(isEventLive)))
            .then(() => dispatch(setLiveEventByString()))
        isLiveEvent(state.eventDate.key + state.currentEvent + state.currentOrg, oppAttPath)
            .then((isOppEventLive) => dispatch(setIsOppEventLive(isOppEventLive)))
    }
}

export function checkPollLive() {
    return (dispatch, getState) => {
        let state = getState();
        if (!state.currentPoll) { 
            dispatch(setIsPollLive(false));
        }
        else{
            isLivePoll(state.currentPoll.uuid)
            .then((isPollLive) => dispatch(setIsPollLive(isPollLive)))
            .then(() => dispatch(setLivePollByID()));
        }
    }
}

export function fetchEventDatesThunk() {
    return (dispatch, getState) => {
        let state = getState();
        const eventDates = [];
        database.ref(`/Organizations/${state.currentOrg}/${state.currentYear}/events/${state.currentEvent}/`).once('value', snap => {
            snap.forEach(data => {
                let dataVal = data.val();
                const eventDate = {
                    key: data.key,
                    props: dataVal.properties ? dataVal.properties : null
                }
                eventDates.push(eventDate)
            })
        })
            .then(() => {
                eventDates.sort(function(a, b) {
                    return b.key.split('-')[0] - a.key.split('-')[0] || b.key.split('-')[1] - a.key.split('-')[1];
                });
                dispatch(fetchEventDates(eventDates))})
            .then(() => eventDates[0] ? dispatch(setEventDate(eventDates[0])): dispatch(setEventDate('')))
            .then(() => dispatch(fetchAttendanceThunk()))
    }
}

export function fetchEventsThunk(newOrg=null, eventName=null) {
    return (dispatch, getState) => {
        let state = getState();
        let org = newOrg ? newOrg : state.currentOrg;
        let events = [];
        database.ref(`/Organizations/${org}/${state.currentYear}/events/`).once('value', snap => {
            snap.forEach(data => {
                events.push(data.key);
            })
        })
            .then(() => dispatch(fetchEvents(events)))
            .then(() => eventName ? dispatch(setEvent(eventName)) : events[0] ? dispatch(setEvent(events[0])) : null)
            .then(() => dispatch(fetchEventDatesThunk()))
    }
}

export function fetchPollsThunk(newOrg=null) {
    return (dispatch, getState) => {
        let state = getState();
        let org = newOrg ? newOrg : state.currentOrg;
        let polls = [];
        database.ref(`/Organizations/${org}/${state.currentYear}/polls/`).once('value', snap => {
            snap.forEach(data => {
                let dataVal = data.val();
                const pollObj = {
                    question: dataVal.question,
                    options: dataVal.options ? dataVal.options[0].percent ? sortBy(dataVal.options, "percent").reverse()
                            : dataVal.options : dataVal.options,
                    organization: dataVal.properties.organization,
                    location: dataVal.properties.location,
                    people: dataVal.people ? sortBy(dataVal.people,"name").sort(function(a, b) {
                        let lastNameCompare = a.name.split(" ").pop().localeCompare(b.name.split(" ").pop());
                        let firstNameCompare = a.name.split(" ")[0].localeCompare(b.name.split(" ")[0]);
                        return lastNameCompare === 0 ? firstNameCompare : lastNameCompare;
                    }) : { none: "null" },
                    uuid: data.key
                }
                polls.push(pollObj);
            })
        })
            .then(() => dispatch(fetchPolls(polls)))
            .then(() => {
                if (state.currentPoll.question !== '') {
                    return polls.filter(obj => {
                        return obj.question === state.currentPoll.question;
                    })[0]
                }
                else {
                    return null;
                }
            })
            .then((newPoll) => (polls[0]) ? (newPoll ? dispatch(setPoll(newPoll)) 
            : dispatch(setPoll(polls[0]))) : dispatch(setPoll({question:'', options:[]})))
            .then(() => polls[0] ? dispatch(checkPollLive()) : null)
    }
}

export function updatePollCounts() {
    return (dispatch, getState) => {
        let state = getState();
        database.ref('/livePolls/').once('value', snap => {
            snap.forEach(data => {
                let totalCount = 0;
                database.ref(`/Organizations/${state.currentOrg}/${state.currentYear}/polls/${data.key}/options/`).once('value', snap => {
                    let options = snap.val();
                    for (let key in options) {
                        options[key].count = 0;
                        options[key].percent = 0;
                    }
                    database.ref(`/Organizations/${state.currentOrg}/${state.currentYear}/polls/${data.key}/people/`).once('value', snap => {
                        snap.forEach(data => {
                            options.filter(obj => { return obj.text === data.val().option })[0].count += 1;
                            totalCount++;
                        })
                    })
                    if(totalCount > 0){
                        for (let key in options) {
                            options[key].percent = +((((options[key].count * 100) / (totalCount * 100)) * 100).toFixed(2));
                        }
                    }
                    database.ref(`/Organizations/${state.currentOrg}/${state.currentYear}/polls/${data.key}/options/`).set(options);
                })
            })
        })
            .then((() => dispatch(fetchPollsThunk())));
    }
}

export function fetchOrgsThunk(netID) {
    return (dispatch) => {        
        let organizations = [];
        if (!netID) {
            netID = "dummy";
        }
        database.ref(`/Admins/${netID}/`).once('value', snap => {
            snap.forEach(data => {
                organizations.push(data.key)
            })
        })
            .then(() => {
                if(organizations[0]){
                    dispatch(fetchOrgs(organizations))
                    dispatch(setOrg(organizations[0]))
                    dispatch(fetchYearsThunk(organizations[0]))
                    dispatch(fetchEventsThunk(organizations[0]))
                    dispatch(fetchPollsThunk(organizations[0]))
                    dispatch(watchPollAdded())
                    dispatch(watchAttendanceAdded())
                }else {
                    dispatch(fetchOrgs([]));
                }})
    }
}

export function fetchAllOrgsThunk() {
    return (dispatch) => {        
        let allOrganizations = [];
        database.ref(`/Organizations/`).once('value', snap => {
            snap.forEach(data => {
                allOrganizations.push(data.key)
            })
        })
            .then(() => dispatch(fetchAllOrgs(allOrganizations)))
    }
}

export function fetchAdminsThunk(newAdmin=null) {
    return (dispatch) => {        
        let admins = [];
        database.ref(`/Admins/`).once('value', snap => {
            snap.forEach(data => {
                admins.push(data.key)
            })
        })
            .then(() => {
                admins.splice( admins.indexOf('dummy'), 1 );
                dispatch(fetchAdmins(admins))})
            .then(() => admins[0] ? newAdmin ? dispatch(setAdmin(newAdmin)) : dispatch(setAdmin(admins[0])) : null)
            .then(() => newAdmin ? dispatch(fetchOrgsThunk(newAdmin)) : dispatch(fetchOrgsThunk(admins[0])))
    }
}

export function fetchYearsThunk(newOrg=null,path=null) {
    let today = new Date();
    let currentYear = today.getFullYear().toString();
    return (dispatch, getState) => {
        let state = getState();
        let org = newOrg ? newOrg : state.currentOrg;
        let years = [];
        if(org.length > 0){
            database.ref(`/Organizations/${org}/`).once('value', snap => {
                snap.forEach(data => {
                    years.push(data.key);
                })
            })
                .then(() => {
                    dispatch(setLoading(false));
                    if(years[0]){
                    if (years.filter(function(e) { return e === currentYear; }).length === 0) {
                        years.push(currentYear);
                      }
                    years.sort(function(a, b){return b-a}); 
                    dispatch(fetchYears(years))
                    dispatch(fetchYear(years[0]))}
                    })
                .then(() => path ? path === "events" ? dispatch(fetchEventsThunk(newOrg)) : 
                path === "polls" ? dispatch(fetchPollsThunk(newOrg)) : null : null)
        }
    }
}

export function fetchAttendanceThunk() {
    return (dispatch, getState) => {
        let state = getState();
        let attendance = [];
        database.ref(`/Organizations/${state.currentOrg}/${state.currentYear}/events/${state.currentEvent}/${state.eventDate.key}/attendance/${state.attPath}/people`).once('value', snap => {
            snap.forEach(data => {
                let dataVal = data.val();
                const attObj = {
                    name: dataVal.name.toLowerCase().replace(/\b(\s\w|^\w)/g, function (txt) { return txt.toUpperCase(); }),
                    email: dataVal.email,
                    time: dataVal.time_logged.toString(),
                    location: dataVal.location
                }
                attendance.push(attObj);
            })
            attendance.sort(function(a, b) {
                let lastNameCompare = a.name.split(" ").pop().localeCompare(b.name.split(" ").pop());
                let firstNameCompare = a.name.split(" ")[0].localeCompare(b.name.split(" ")[0]);
                return lastNameCompare === 0 ? firstNameCompare : lastNameCompare;
            });
        })
            .then(() => dispatch(fetchAtt(attendance)))
            .then(() => dispatch(checkEventLive()))
    }
}

export function setLiveEventByString() {
    return (dispatch, getState) => {
        if (!window.location.pathname.startsWith("/admin/")) {
            return false;
        };
        let state = getState();
        for (let i = 0; i < state.liveEvents.length; i++) {
            if (state.liveEvents[i].event === state.currentEvent
                && state.liveEvents[i].organization === state.currentOrg
                && state.liveEvents[i].attPath === state.attPath) {
                dispatch(setLiveEvent(state.liveEvents[i]));
                i = state.liveEvents.length;
                break;
            }
        }
    }
}

export function setLivePollByID() {
    return (dispatch, getState) => {
        if (!window.location.pathname.startsWith("/admin/")) {
            return false;
        };
        let state = getState();
        for (let i = 0; i < state.livePolls.length; i++) {
            if (state.livePolls[i].uuid === state.currentPoll.uuid) {
                dispatch(setLivePoll(state.livePolls[i]));
                i = state.livePolls.length;
                break;
            }
        }
    }
}

export function fetchLiveEventsThunk() {
    return (dispatch) => {
        let liveEvents = [];
        database.ref(`/liveEvents/`).once('value', snap => {
            snap.forEach(data => {
                liveEvents.push(data.val())
            })
        })
            .then(() => dispatch(fetchLiveEvents(liveEvents)))
            .then(() => liveEvents[0] ? dispatch(setLiveEvent(liveEvents[0])) : null)
            .then(() => dispatch(checkEventLive()))
    }
}

export function fetchLivePollsThunk() {
    return (dispatch) => {
        let livePolls = [];
        database.ref(`/livePolls/`).once('value', snap => {
            snap.forEach(data => {
                livePolls.push(data.val())
            })
        })
            .then(() => dispatch(fetchLivePolls(livePolls)))
            .then(() => livePolls[0] ? dispatch(setLivePoll(livePolls[0])) : null)
            .then(() => livePolls[0] ? dispatch(setCurrentOption(livePolls[0].options[0].text)) : null)
            .then(() => dispatch(checkPollLive()))
    }
}

/*LISTENERS*/

export function watchAttendanceAdded(newOrg=null) {
    return (dispatch, getState) => {
        let state = getState();
        let org = newOrg ? newOrg : state.currentOrg;
        database.ref(`/Organizations/${org}/${state.currentYear}/events/`).on('child_added', () => {
            dispatch(fetchAttendanceThunk());
        });
        database.ref(`/Organizations/${state.currentOrg}/${state.currentYear}/events/`).on('child_changed', () => {
            dispatch(fetchAttendanceThunk());
        });
    }
}

export function offWatchAttendanceAdded() {
    return (dispatch, getState) => {
        let state = getState();
        database.ref(`/Organizations/${state.currentOrg}/${state.currentYear}/events/`).off('child_added');
        database.ref(`/Organizations/${state.currentOrg}/${state.currentYear}/events/`).off('child_changed');
    }
}

export function watchLiveEvents() {
    return dispatch => {
        database.ref(`/liveEvents/`).on('child_added', () => {
            dispatch(fetchLiveEventsThunk());
        });
        database.ref(`/liveEvents/`).on('child_removed', () => {
            dispatch(fetchLiveEventsThunk());
        });
    }
}

export function watchPollAdded(newOrg=null) {
    return (dispatch, getState) => {
        let state = getState();
        let org = newOrg ? newOrg : state.currentOrg;
        database.ref(`/Organizations/${org}/${state.currentYear}/polls/`).on('child_added', () => {
            dispatch(updatePollCounts());
        });
        database.ref(`/Organizations/${state.currentOrg}/${state.currentYear}/polls/`).on('child_changed', () => {
            dispatch(updatePollCounts());
        });
    }
}

export function offWatchPollAdded() {
    return (dispatch, getState) => {
        let state = getState();
        database.ref(`/Organizations/${state.currentOrg}/${state.currentYear}/polls/`).off('child_added');
        database.ref(`/Organizations/${state.currentOrg}/${state.currentYear}/polls/`).off('child_changed');
    }
}

export function watchLivePolls() {
    return dispatch => {
        database.ref(`/livePolls/`).on('child_added', () => {
            dispatch(fetchLivePollsThunk());
        });
        database.ref(`/livePolls/`).on('child_removed', () => {
            dispatch(fetchLivePollsThunk());
        });
    }
}
