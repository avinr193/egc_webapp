import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'

import reducers from './store/reducers'

const initialState = {};

const store = applyMiddleware(thunk)(createStore)(reducers, initialState,window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

export default store