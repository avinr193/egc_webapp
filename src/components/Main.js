import React from 'react';

import { Switch, Route, Redirect } from 'react-router-dom';

import Home from '../pages/Home'
import About from '../pages/About'
import Attendance from '../pages/Attendance'
import Voting from '../pages/Voting'
import AdminAtt from '../pages/Admin/AdminAtt'
import AdminPoll from '../pages/Admin/AdminPoll'
import AdminEvnt from '../pages/Admin/AdminEvnt'
import AdminAdOrgs from '../pages/Admin/AdminAdOrgs'
import AdminRprt from '../pages/Admin/AdminRprt'

const Main = () => (
  <Switch>
    <Route exact path='/home' component={Home}></Route>
    <Route exact path='/about' component={About}></Route>
    <Route exact path='/attendance' component={Attendance}></Route>
    <Route exact path='/voting' component={Voting}></Route>
    <Route exact path='/admin/attendance' component={AdminAtt}></Route>
    <Route exact path='/admin/polling' component={AdminPoll}></Route>
    <Route exact path='/admin/events' component={AdminEvnt}></Route>
    <Route exact path='/admin/adorgs' component={AdminAdOrgs}></Route>
    <Route exact path='/admin/reports' component={AdminRprt}></Route>

    <Redirect exact from="/admin*" to="/admin/attendance" />
    <Redirect exact from="*" to="/attendance" />
  </Switch>
);

export default Main;