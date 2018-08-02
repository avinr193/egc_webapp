import { combineReducers } from 'redux'

import { ActionTypes } from './actions'

const events = (state = [], action) => {
    return (action.type === ActionTypes.FETCH_EVENTS) ? action.events : state
}

const organizations = (state = [], action) => {
    return (action.type === ActionTypes.FETCH_ORGS) ? action.organizations : state
}

const attendance = (state = [], action) => {
    return (action.type === ActionTypes.FETCH_ATT) ? action.attendance : state
}

const currentDate = (state = '', action) => {
    return (action.type === ActionTypes.FETCH_DATE) ? action.date : state
}

const currentEvent = (state = '', action) => {
    return (action.type === ActionTypes.SET_EVENT) ? action.newEvent : state
}

export default combineReducers ({
    events, organizations, attendance, currentDate, currentEvent
})