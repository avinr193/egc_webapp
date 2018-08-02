import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import App from './App';
import store from './store';

window.React = React;
window.store = store;

const render = (Component) => ReactDOM.render((
  <BrowserRouter>
      <Provider store={store}> 
        <Component />
      </Provider>
    </BrowserRouter>
), document.getElementById('root'))

render((App));

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default
    render((NextApp));
  })
}