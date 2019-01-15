import React from 'react';
import ReactDOM from 'react-dom';
import firebase, { signOut } from '../firebase'
import 'firebase/auth'

import { NavLink, Link } from 'react-router-dom';

import IconMenu from 'material-ui/IconMenu'
import IconButton from 'material-ui/IconButton'
import MenuItem from 'material-ui/MenuItem'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';

const Navigation = () => (
  <nav>
    <ul id="paginate">
      <li style={{ padding: 5 }}><NavLink exact to='/home'><img style={{ height: "90%", width: "100%" }} src={require('../egc.png')} alt="egc logo" /></NavLink></li>
      <li><NavLink exact activeClassName="current" to='/attendance'>Attendance</NavLink></li>
      <li><NavLink exact activeClassName="current" to='/voting'>Voting</NavLink></li>
      <li>
        <AdminPopover />
      </li>
      <li><NavLink exact activeClassName="current" to='/about'>About</NavLink></li>
      <li><SignInButton /></li>
    </ul>
  </nav>
);

export default Navigation;

class SignInButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      label: "SIGN-IN",
      enabled: true
    }
  }

  componentDidMount() {
    this.editButton = ReactDOM.findDOMNode(this.refs.editButton)
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          enabled: false,
          label: user.displayName // update it here
        })
      }
    });
  }

  render() {
    return (
      (this.state.enabled ?
        null
        :
        <div>
          <IconMenu
            iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
            anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
            targetOrigin={{ horizontal: 'right', vertical: 'top' }}
            iconStyle={{ color: "#FFFFFF" }}
          >
            <MenuItem onClick={() => signOut()} primaryText="Sign out" />
            <MenuItem primaryText="Close" />
          </IconMenu>
        </div>)
    )
  }
}

class AdminPopover extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
  }

  handleClick = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    return (
      <div>
        <NavLink onClick={this.handleClick} exact activeClassName="current" to='/admin*'>Admin</NavLink>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.handleRequestClose}
        >
          <Menu>
            <Link exact="true" to='/admin/attendance' style={{ textDecoration: 'none' }}>
              <MenuItem primaryText="Attendance"></MenuItem>
            </Link>
            <Link exact="true" to='/admin/polling' style={{ textDecoration: 'none' }}>
              <MenuItem primaryText="Polls"></MenuItem>
            </Link>
            <Link exact="true" to='/admin/events' style={{ textDecoration: 'none' }}>
              <MenuItem primaryText="Events"></MenuItem>
            </Link>
            <Link exact="true" to='/admin/adorgs' style={{ textDecoration: 'none' }}>
              <MenuItem primaryText="Admins/Orgs"></MenuItem>
            </Link>
            <Link exact="true" to='/admin/reports' style={{ textDecoration: 'none' }}>
              <MenuItem primaryText="Reports"></MenuItem>
            </Link>
            <MenuItem primaryText="Close" onClick={this.handleRequestClose} />
          </Menu>
        </Popover>
      </div>
    );
  }
}