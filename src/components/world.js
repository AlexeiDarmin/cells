import React, { Component } from 'react';
import Simulation from '../helpers/simulation'
import '../App.css';

let sim = new Simulation(10)

class World extends Component {

  constructor(props) {
    super(props)
    
    this.state = {
      cells: sim.cells
    }
  }

  componentDidMount(){
    sim.start()
    setInterval(() => {
      this.setState({
        cells: sim.cells
      })
    }, 16)
  }

  renderCell(cell, key) {
    const styles = {
      marginLeft: cell.position.x * 4,
      marginTop: cell.position.y * 4,
      backgroundColor: cell.lineage,
    }

    return (<div className="cell" style={styles} key={cell.id}/>)
  }

  render() {
    const { cells } = this.state

    return (
      <div className="world">
        {cells.map((c, key) => this.renderCell(c, key))}
      </div>
    );
  }
}

export default World;
