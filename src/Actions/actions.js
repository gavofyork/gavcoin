// Copyright 2016 Gavin Wood 

import React, { Component, PropTypes } from 'react';

import { RaisedButton } from 'material-ui';
import ActionAddShoppingCart from 'material-ui/svg-icons/action/add-shopping-cart';
// import AvReplay from 'material-ui/svg-icons/av/replay';
import ContentSend from 'material-ui/svg-icons/content/send';

import styles from './actions.css';

export default class Actions extends Component {
  static propTypes = {
    onAction: PropTypes.func.isRequired,
    gavBalance: PropTypes.object.isRequired
  }

  render () {
    const { gavBalance } = this.props;

    return (
      <div className={ styles.actions }>
        <RaisedButton
          className={ styles.button }
          icon={ <ActionAddShoppingCart /> }
          label='buy coins'
          primary
          onTouchTap={ this.onBuyIn } />
        <RaisedButton
          disabled={ !gavBalance || gavBalance.eq(0) }
          className={ styles.button }
          icon={ <ContentSend /> }
          label='send coins'
          primary
          onTouchTap={ this.onTransfer } />
      </div>
    );

    // <RaisedButton
    //   className={ styles.button }
    //   icon={ <AvReplay /> }
    //   label='claim refund'
    //   primary
    //   onTouchTap={ this.onRefund } />
  }

  onBuyIn = () => {
    this.props.onAction('BuyIn');
  }

  onTransfer = () => {
    const { gavBalance } = this.props;

    if (gavBalance && gavBalance.gt(0)) {
      this.props.onAction('Transfer');
    }
  }

  onRefund = () => {
    this.props.onAction('Refund');
  }
}
