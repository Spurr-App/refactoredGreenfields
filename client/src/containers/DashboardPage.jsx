/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

import React from 'react';
import Auth from '../modules/Auth.js';
import Dashboard from '../components/Dashboard.jsx';

class DashboardPage extends React.Component {

  static linkToCalender({ eventDateObj, eventTimeObj, title, description, location }) {
    const dateTime = `${eventDateObj.slice(0, 10)}T${eventTimeObj.slice(11)}`
      .replace(/-|:|\.\d\d\d/g, '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title.replace(' ', '+')}&dates=${dateTime}/${dateTime}&details=${description.replace(' ', '+')}&location=${location.split('longitude')[0].replace(' ', '+').replace(',', '')}&sf=true&output=xml`;

    window.open(url);
  }

  static parseCoordinates(eventObj) {
    if (!eventObj.location) {
      return eventObj;
    }
    let coordinates = eventObj.location.split('longitude');
    const coordinateObj = {
      address: coordinates[0],
    };
    coordinates = coordinates[1].split(' ');
    coordinateObj.latitude = +coordinates[coordinates.length - 1];
    coordinateObj.longitude = +coordinates[1];
    // console.log('parse coords', coordinateObj);
    return coordinateObj;
  }

  constructor(props) {
    super(props);
    this.state = {
      viewForm: false,
      secretData: '',
      eventList: [],
      detailsBox: {
        name,
      },
      location: {
        longitude: null,
        latitude: null,
        address: null,
      },
    };
    this.linkToCalender = this.constructor.linkToCalender;
    this.fetchEvents();

    // parseCoordinates = this.parseCoordinates.bind(this);
    this.setCoordinates = this.setCoordinates.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.setDetailsBox = this.setDetailsBox.bind(this);
    this.fetchEvents = this.fetchEvents.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
  }

  /**
   * This method will be executed after initial rendering.
   * @param {none} sets security token
   * @returns sets secret message on state for authorization
   * with the given location
   */
  componentDidMount() {
    fetch('/api/dashboard', {
      method: 'GET',
      headers: new Headers({
        'Content-type': 'application/x-www-form-urlencoded',
        authorization: `bearer ${(Auth.getToken())}`,
      }),
    })
    .then(res => res.json())
    .then(data => this.setState({ secretData: data.message }))
    .catch(err => `Whoops: ${err}`);
  }

  /**
   * Returns the sum of a and b
   * @param {event} the event object a user clicks on
   * @return Sets the state detailbox to the clicked event
   */
  setDetailsBox(detailsBox) {
    this.setState({ detailsBox });
    const location = this.constructor.parseCoordinates(detailsBox);
    this.setState({ location });
  }

  /**
   * @param {object} eventObj : either a set of coordinates, or an event object with location key
   * @returns {object} Sets the state coordinates, for each event list member
   */
  setCoordinates(eventObj) {
    const location = this.constructor.parseCoordinates(eventObj);
    this.setState({ location });
  }

  /**
   * viewForm variables declares whether create event form is shown
   */
  handleToggle() {
    const now = !this.state.viewForm;
    this.setState({ viewForm: now });
  }

 /**
  * @param {events} a list of event objects from query
  * @returns Sets the state eventlist to the array of events
  */
  fetchEvents() {
    fetch('/events')
      .then(events => events.json())
      .then((eventList) => {
        this.setState({ eventList, detailsBox: eventList[0] });
      })
      .catch(err => console.error(err));
  }

  deleteEvent(event) {
    // TODO: this is async and should be fixed, then is not working
    const that = this;
    fetch(`/deleteEvent/${event._id}`, {
      method: 'DELETE',
    })
    .then(() => {
      that.fetchEvents();
    });
  }

  render() {
    // TODO: Was passing coordinates but it was undefined...this may be a bug
    return (
      <Dashboard
        data={this.state}
        lat={this.state.location.latitude}
        lng={this.state.location.longitude}
        address={this.state.location.address}
        fetchEvents={this.fetchEvents}
        deleteEvent={this.deleteEvent}
        setDetailsBox={this.setDetailsBox}
        setCoordinates={this.setCoordinates}
        linkToCalender={this.constructor.linkToCalender}
      />
    );
  }

}

export default DashboardPage;
