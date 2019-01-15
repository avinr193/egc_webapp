import { combineReducers } from 'redux'

import { ActionTypes } from './actions'

const events = (state = [], action) => {
    return (action.type === ActionTypes.FETCH_EVENTS) ? action.events : state
}

const isAdmin = (state = false, action) => {
    return (action.type === ActionTypes.SET_IS_ADMIN) ? action.isAdmin : state
}

const liveEvents = (state = [], action) => {
    return (action.type === ActionTypes.FETCH_LIVE_EVENTS && action.liveEvents) ? action.liveEvents : state
}

const currentLiveEvent = (state = {}, action) => {
    return (action.type === ActionTypes.SET_LIVE_EVENT && action.newLiveEvent) ? action.newLiveEvent : state
}

const livePolls = (state = [], action) => {
    return (action.type === ActionTypes.FETCH_LIVE_POLLS && action.livePolls) ? action.livePolls : state
}

const currentLivePoll = (state = {}, action) => {
    return (action.type === ActionTypes.SET_LIVE_POLL && action.newLivePoll) ? action.newLivePoll : state
}

const currentOption = (state = '', action) => {
    return (action.type === ActionTypes.SET_CURRENT_OPTION && action.newOption) ? action.newOption : state
}

const isEventLive = (state = false, action) => {
    return (action.type === ActionTypes.SET_IS_EVENT_LIVE) ? action.isEventLive : state
}

const isPollLive = (state = false, action) => {
    return (action.type === ActionTypes.SET_IS_POLL_LIVE) ? action.isPollLive : state
}

const attPath = (state = "opening", action) => {
    return (action.type === ActionTypes.SET_ATT_PATH && action.newAttPath) ? action.newAttPath : state
}

const organizations = (state = [], action) => {
    return (action.type === ActionTypes.FETCH_ORGS && action.organizations) ? action.organizations : state
}

const allOrganizations = (state = [], action) => {
    return (action.type === ActionTypes.FETCH_ALL_ORGS && action.allOrganizations) ? action.allOrganizations : state
}

const years = (state = [], action) => {
    return (action.type === ActionTypes.FETCH_YEARS && action.years) ? action.years : state
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

const currentYear = (state = '', action) => {
    return (action.type === ActionTypes.FETCH_YEAR && action.year) ? action.year : state
}

const currentEvent = (state = '', action) => {
    return (action.type === ActionTypes.SET_EVENT && action.newEvent) ? action.newEvent : state
}

const currentOrg = (state = '', action) => {
    return (action.type === ActionTypes.SET_ORG && action.newOrg) ? action.newOrg : state
}

const polls = (state = [], action) => {
    return (action.type === ActionTypes.FETCH_POLLS && action.polls) ? action.polls : state
}

const currentPoll = (state = { question: '', options: [] }, action) => {
    return (action.type === ActionTypes.SET_POLL && action.poll) ? action.poll : state
}

const admins = (state = [], action) => {
    return (action.type === ActionTypes.FETCH_ADMINS && action.admins) ? action.admins : state
}

const currentAdmin = (state = '', action) => {
    return (action.type === ActionTypes.SET_ADMIN && action.newAdmin) ? action.newAdmin : state
}

export default combineReducers({
    events, organizations, attendance, currentDate, currentEvent,
    currentOrg, eventDates, eventDate, liveEvents, currentLiveEvent, isEventLive, attPath,
    polls, currentPoll, isPollLive, livePolls, currentLivePoll, isAdmin, currentOption, currentYear, 
    years, admins, currentAdmin, allOrganizations
})