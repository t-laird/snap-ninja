import React, { Component } from 'react';
import './Transaction.css';
import getKeyFromLS from '../../helpers/getKeyFromLS';

class Transaction extends Component {
  constructor() {
    super();
    this.state = {
      points: '',
      recipient: '',
      validInput: true
    };
  }

  handleInput = (e) => {
    const {value, name} = e.target;

    this.setState({[name]: value});
  }

  pointStatus() {
    const { points } = this.state;
    const parsePoints = parseInt(points);

    if (
      (isNaN(parsePoints) || 
      parsePoints > 100) &&
      points.length
    ) {
      return <span className="point-error">X</span>
    } else {
      return null;
    }
  }

  getRemainingPoints() {
    return <span>remaining points: {100-30}</span>
  }

  async handleSubmit() {
    const send_id = 123;
    const receive_id = parseInt(this.state.recipient);
    const group_id = 123;
    const point_value = parseInt(this.state.points);

    const submitEvent = await fetch('http://localhost:3000/api/v1/eventtracking/new', {
      method: 'POST',
      headers: {
        'CONTENT-TYPE': 'application/json',
        'x-token': getKeyFromLS()
      },
      body: JSON.stringify({send_id, receive_id, group_id, point_value})
    });

    const submitResponse = await submitEvent.json();
    console.log(submitResponse);
  }

  render() {
    return (
      <div className="Transaction">
        <div className="remaining-points">
          {this.getRemainingPoints()}
        </div>
        <div className="points">
          <input 
            type="text" 
            name="points" 
            placeholder="points" 
            value={this.state.points} 
            className="points"
            onChange={(e) => {this.handleInput(e)}} />
          {this.pointStatus()}
        </div>
        <input 
          type="text" 
          name="recipient" 
          placeholder="recipient" 
          value={this.state.recipient} 
          onChange={(e) => {this.handleInput(e)}} />
        <button onClick={()=> {this.handleSubmit()}}>SEND!</button>
      </div>
    );
  }
}


export default Transaction;