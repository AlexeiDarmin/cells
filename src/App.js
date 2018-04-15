import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import World from './components/world'

class App extends Component {
  render() {
    return (
      <div className="App">
        <World />
      </div>
    );
  }
}

export default App;
