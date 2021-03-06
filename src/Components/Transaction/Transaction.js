/* eslint-disable max-len */

import React, { Component } from 'react';
import './Transaction.css';
import getKeyFromLS from '../../helpers/getKeyFromLS';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as actions from '../../Actions';
import getGroupSettings from '../../helpers/fetches/getGroupSettings/getGroupSettings';
import getGroupTransactionData from '../../helpers/fetches/getGroupTransactionData/getGroupTransactionData';
import getTransactionData from '../../helpers/fetches/getTransactionData/getTransactionData';
import getUser from '../../helpers/fetches/getUser/getUser';
import PointsInformation from '../PointsInformation/PointsInformation';
import GroupMembers from '../GroupMembers/GroupMembers';
import RecipientInput from '../RecipientInput/RecipientInput';
 
export class Transaction extends Component {
  constructor() {
    super();
    this.state = {
      points: '',
      recipient: '',
      note: '',
      validInput: true,
      suggestions: [],
      transactionMessage: null,
      messageClass: 't-message-1'
    };
  }

  handleInput = (event) => {
    const {value, name} = event.target;

    if (name === 'note' && value.length > 140) {
      return;
    }
    this.setState({[name]: value});
  }

  pointStatus() {
    const { points } = this.state;
    const parsePoints = parseInt(points, 10);

    if (
      (isNaN(parsePoints) || 
      parsePoints > 100) &&
      points.length
    ) {
      return <span className="point-error">X</span>;
    } else {
      return null;
    }
  }

  async handleSubmit() {
    const recipient = new RegExp(this.state.recipient, 'gi');
    const findReceivingUser = this.props.UserList.find( user => recipient.test(user.name) );
 
    if (!findReceivingUser) {
      this.errorMessage("Can't locate receiving user.");
      this.setState({
        suggestions: []
      });
      return;
    }

    const transactionInformation = {
      send_id: this.props.User.user_id,
      receive_id: findReceivingUser.user_id,
      group_id: this.props.User.group_id,
      point_value: parseInt(this.state.points, 10),
      recipient_name: findReceivingUser.name,
      note: this.state.note
    };


    for (let requiredParameter of [
      'send_id', 
      'receive_id', 
      'group_id', 
      'point_value', 
      'recipient_name'
    ]) {
      if (!transactionInformation[requiredParameter]) {

        this.errorMessage(`Please send a valid ${requiredParameter}.`);
        this.setState({
          suggestions: [],
          recipient: ''
        });
      }
    }

    if (this.state.recipient.length < 3) {
      return;
    }

    const submitEvent = await fetch('https://snapninja.herokuapp.com/api/v1/eventtracking/new', {
      method: 'POST',
      headers: {
        'CONTENT-TYPE': 'application/json',
        'x-token': getKeyFromLS()
      },
      body: JSON.stringify({
        send_id: transactionInformation.send_id, 
        receive_id: transactionInformation.receive_id, 
        group_id: transactionInformation.group_id, 
        point_value: transactionInformation.point_value,
        note: transactionInformation.note
      })
    });

    const submitResponse = await submitEvent.json();

    if (submitResponse.status === 'success') {
      this.successMessage(this.state.points, transactionInformation.recipient_name);

      this.setState({
        recipient: '',
        suggestions: [],
        points: '',
        note: ''
      });


      this.fetchUserData();

    } else if (submitResponse.status === 'failure') {

      this.errorMessage(submitResponse.error);
      this.setState({
        suggestions: []
      });
    }
  }

  errorMessage = (message) => {
    if (document.querySelector('.t-message-1')) {
      document.querySelector('.t-message-1').className = 't-message-0';
      this.setState({
        transactionMessage: 
          <div>
            <img className="warning-icon" src={require('./assets/warning.svg')} alt="warning" />
            {message}
          </div>
      });
      setTimeout(() => {
        document.querySelector('.t-message-0').className = 't-message-1';
      }, 10);
      setTimeout(() => {
        if (document.querySelector('.t-message-1')) {
          document.querySelector('.t-message-1').className = 't-message-2';
        }
      }, 4010);
      setTimeout(() => {
        if (document.querySelector('.t-message-2')) {
          this.setState({transactionMessage: null});
          document.querySelector('.t-message-2').className = 't-message-1';
        }
      }, 4410);
    }
  }

  successMessage = (points, recipient) => {
    if (document.querySelector('.t-message-1')) {
      document.querySelector('.t-message-1').className = 't-message-0';
      this.setState({
        transactionMessage: 
          <div>
            <img className="success-icon" src={require('./assets/success.svg')} alt="success" />
            You sent {points} snaps to {recipient}!
          </div>
      });
      setTimeout(() => {
        document.querySelector('.t-message-0').className = 't-message-1';
      }, 10);
      setTimeout(() => {
        if (document.querySelector('.t-message-1')) {
          document.querySelector('.t-message-1').className = 't-message-2';
        }
      }, 4010);
      setTimeout(() => {
        if (document.querySelector('.t-message-2')) {
          this.setState({transactionMessage: null});
          document.querySelector('.t-message-2').className = 't-message-1';
        }
      }, 4410);
    }
  }

  fetchUserData = async () => {
    const userData = await this.loadUser();
    if (userData) {
      await this.loadTransactionData(userData);
      if (userData.group_id !== null) {
        const groupData = await this.loadGroupSettings(userData);
        await this.loadGroupTransactionData(groupData);
      }
    }
  }

  loadUser = async () => {
    try {
      const user = await getUser();
      this.props.updateUser(user);
      return user;
    } catch (error) {
      window.location="https://tr-personal-proj.e1.loginrocket.com";
      return;
    }
  }

  loadTransactionData = async (userData) => {
    try {
      const userTransactions = await getTransactionData(userData);
      this.props.updateUserTransactions(userTransactions);
    } catch (error) {
      window.location="https://tr-personal-proj.e1.loginrocket.com";
      return;
    }
  }

  loadGroupSettings = async (userData) => {
    try {
      if (!userData.group_id) {
        throw new Error('user not in group');
      }
      const groupData = await getGroupSettings(userData);

      this.props.updateGroup(groupData);
      return groupData;
    } catch (error) {
      window.location="https://tr-personal-proj.e1.loginrocket.com";
      return; 
    }
  }

  loadGroupTransactionData = async (groupData) => {
    try {
      const groupTransactions = await getGroupTransactionData(groupData);
      this.props.updateGroupTransactions(groupTransactions);

    } catch (error) {
      window.location="https://tr-personal-proj.e1.loginrocket.com/";
      return;
    }
  }

  updateRecipient = (recipient) => {
    this.setState({recipient});
  }

  displayChars = () => {
    return 140 - this.state.note.length;
  }

  render() {
    return (
      <div className="Transaction">
        <h4 className="heading">SEND SNAPS</h4>
        <PointsInformation />
        <div className="award-header">
          <h4>AWARD</h4>
        </div>
        <div className="points-block">
          <div className="award">
            <div className="send-input">
              <h5 className="send">Send</h5>
              <input 
                type="text" 
                name="points" 
                placeholder="QTY" 
                value={this.state.points} 
                onChange={(event) => { this.handleInput(event); }} />
            </div>
            <RecipientInput recipient={this.state.recipient} updateRecipient={this.updateRecipient}/>
          </div>
          <div className="input-container">
            <h6 className="char-display">{this.displayChars()}</h6>           
            <textarea
              className="note-input"
              type="text"
              name="note"
              placeholder="add a message"
              value={this.state.note}
              onChange={(event) => { this.handleInput(event); }}
            >
            </textarea>
          </div>
          <button onClick={()=> { this.handleSubmit(); }}>SEND</button>
          <div className="transaction-message">
            <h3 className="t-message-1">{this.state.transactionMessage}</h3>
          </div>
        </div>
        <GroupMembers updateRecipient={this.updateRecipient}/>
      </div>
    );
  }
}

export const mapStateToProps = ( store ) => ({
  UserList: store.UserList,
  User: store.User
});

export const mapDispatchToProps = ( dispatch ) => ({
  updateUser: user => {
    dispatch(actions.updateUser(user));
  },
  updateUserTransactions: transactions => {
    dispatch(actions.updateUserTransactions(transactions));
  },
  updateGroupTransactions: groupTransactions => {
    dispatch(actions.updateGroupTransactions(groupTransactions));
  },
  updateGroup: group => {
    dispatch(actions.updateGroup(group));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Transaction);

Transaction.propTypes = {
  User: PropTypes.object,
  Group: PropTypes.object,
  UserList: PropTypes.array,
  UserTransactions: PropTypes.array,
  updateUser: PropTypes.func,
  updateUserTransactions: PropTypes.func,
  updateGroupTransactions: PropTypes.func,
  updateUserList: PropTypes.func,
  updateUserGroup: PropTypes.func,
  updateGroup: PropTypes.func
};