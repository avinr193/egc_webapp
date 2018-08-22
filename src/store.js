import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'

import reducers from './store/reducers'

const initialState = (localStorage["redux-store"]) ?
    {} :
    {}

const store = applyMiddleware(thunk)(createStore)(reducers, initialState,window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

const saveState = () => 
    localStorage["redux-store"] = JSON.stringify(store.getState())

store.subscribe(saveState);

export default store