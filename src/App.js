import React, { Component } from 'react';

import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import axios from 'axios'


import logo from './logo.svg';
import './App.css';

moment.locale('en-GB');
BigCalendar.momentLocalizer(moment);

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      cal_events: [

      ],
    }

  }

  componentDidMount() {

    let self = this

    axios.get('http://localhost:3001/events')
      .then(function (response) {
        console.log(response.data);
        var appointments = response.data;
        
        for (var i = 0; i < appointments.length; i++) {
          appointments[i].start = moment.utc(appointments[i].start).toDate();
          appointments[i].end = moment.utc(appointments[i].end).toDate();
          // console.log(appointments[i])
        }

        self.setState({
          cal_events:appointments
        })
  
      })
      .catch(function (error) {
        console.log(error);
      });
  }


  render() {

    const { cal_events } = this.state

    console.log(cal_events)

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Level-up Larry</h1>
        </header>
        <div style={{ height: 700 }}>
          <BigCalendar
            events={cal_events}
            step={60}
            view='week'
            views={['week','day']}
            min={new Date(2018, 0, 1, 8, 0)} // 8.00 AM
            max={new Date(2018, 0, 1, 17, 0)} // Max will be 6.00 PM!
            date={new Date(2018, 0, 1)}
          />
        </div>
      </div>
    );
  }
}

export default App;
