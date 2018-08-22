import { combineReducers } from 'redux'

import { ActionTypes } from './actions'

const events = (state = [], action) => {
    return (action.type === ActionTypes.FETCH_EVENTS) ? action.events : state
}

const liveEvents = (state = [], action) => {
    return (action.type === ActionTypes.FETCH_LIVE_EVENTS && action.liveEvents) ? action.liveEvents : state
}

const organizations = (state = [], action) => {
    return (action.type === ActionTypes.FETCH_ORGS && action.organizations) ? action.organizations : state
}

const attendance = (state = [], action) => {
    return (action.type === ActionTypes.FETCH_ATT && action.attendance) ? action.attendance : state
}

const eventDates = (state = [], action) => {
    return (action.type === ActionTypes.FETCH_EVENT_DATES && action.eventDates) ? action.eventDates : state
}

const eventDate = (state = '', action) => {
    return (action.type === ActionTypes.SET_EVENT_DATE && action.eventDate) ? action.eventDate : state
}

const currentDate = (state = '', action) => {
    return (action.type === ActionTypes.FETCH_DATE && action.date) ? action.date : state
}

const currentEvent = (state = '', action) => {
    return (action.type === ActionTypes.SET_EVENT && action.newEvent) ? action.newEvent : state
}

const currentOrg = (state = 'Engineering Governing Council', action) => {
    return (action.type === ActionTypes.SET_ORG && action.newOrg) ? action.newOrg : state
}

export default combineReducers ({
    events, organizations, attendance, currentDate, currentEvent, 
    currentOrg, eventDates, eventDate, liveEvents
})