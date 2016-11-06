// Copyright 2016 Gavin Wood

import BigNumber from 'bignumber.js';
import React, { Component, PropTypes } from 'react';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

const muiTheme = getMuiTheme(lightBaseTheme);

import { api } from '../parity';

import * as abis from '../contracts';

import Accounts from '../Accounts';
import Actions, { ActionBuyIn, ActionRefund, ActionTransfer } from '../Actions';
import Events from '../Events';
import Loading from '../Loading';
import Status from '../Status';

import styles from './application.css';
import bgimage from '../../assets/images/gavcoin-bg.jpg';

const bgstyle = {
  backgroundImage: `url(${bgimage})`
};

const DIVISOR = 10 ** 6;

export default class Application extends Component {
  static childContextTypes = {
    api: PropTypes.object,
    contract: PropTypes.object,
    instance: PropTypes.object,
    muiTheme: PropTypes.object
  };

  state = {
    action: null,
    address: null,
    accounts: [],
    accountsInfo: {},
    blockNumber: new BigNumber(-1),
    ethBalance: new BigNumber(0),
    gavBalance: new BigNumber(0),
    instance: null,
    loading: true,
    price: null,
    remaining: null,
    totalSupply: null
  }

  componentDidMount () {
    this.attachInterface();
  }

  render () {
    const { accounts, accountsInfo, address, blockNumber, gavBalance, loading, price, remaining, totalSupply } = this.state;

    if (loading) {
      return (
        <Loading />
      );
    }

    return (
      <div className={ styles.body } style={ bgstyle }>
        { this.renderModals() }
        <Status
          address={ address }
          blockNumber={ blockNumber }
          gavBalance={ gavBalance }
          price={ price }
          remaining={ remaining }
          totalSupply={ totalSupply }>
          <Accounts
            accounts={ accounts } />
        </Status>
        <Actions
          gavBalance={ gavBalance }
          onAction={ this.onAction } />
        <Events
          accountsInfo={ accountsInfo } />
      </div>
    );
  }

  renderModals () {
    const { action, accounts, price } = this.state;

    switch (action) {
      case 'BuyIn':
        return (
          <ActionBuyIn
            accounts={ accounts }
            price={ price }
            onClose={ this.onActionClose } />
        );
      case 'Refund':
        return (
          <ActionRefund
            accounts={ accounts }
            price={ price }
            onClose={ this.onActionClose } />
        );
      case 'Transfer':
        return (
          <ActionTransfer
            accounts={ accounts }
            onClose={ this.onActionClose } />
        );
      default:
        return null;
    }
  }

  getChildContext () {
    const { contract, instance } = this.state;

    return {
      api,
      contract,
      instance,
      muiTheme
    };
  }

  onAction = (action) => {
    this.setState({
      action
    });
  }

  onActionClose = () => {
    this.setState({
      action: null
    });
  }

  onNewBlockNumber = (_error, blockNumber) => {
    const { instance, accounts } = this.state;

    if (_error) {
      console.error('onNewBlockNumber', _error);
      return;
    }

    Promise
      .all([
        instance.totalSupply.call(),
        instance.remaining.call(),
        instance.price.call()
      ])
      .then(([totalSupply, remaining, price]) => {
        this.setState({
          blockNumber,
          totalSupply,
          remaining,
          price
        });

        const gavQueries = accounts.map((account) => instance.balanceOf.call({}, [account.address]));
        const ethQueries = accounts.map((account) => api.eth.getBalance(account.address));

        return Promise.all([
          Promise.all(gavQueries),
          Promise.all(ethQueries)
        ]);
      })
      .then(([gavBalances, ethBalances]) => {
        this.setState({
          ethBalance: ethBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
          gavBalance: gavBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
          accounts: accounts.map((account, idx) => {
            const ethBalance = ethBalances[idx];
            const gavBalance = gavBalances[idx];

            account.ethBalance = api.util.fromWei(ethBalance).toFormat(3);
            account.gavBalance = gavBalance.div(DIVISOR).toFormat(6);
            account.hasGav = gavBalance.gt(0);

            return account;
          })
        });
      })
      .catch((error) => {
        console.warn('onNewBlockNumber', error);
      });
  }

  attachInterface = () => {
    api.parity
      .registryAddress()
      .then((registryAddress) => {
        console.log(`the registry was found at ${registryAddress}`);

        const registry = api.newContract(abis.registry, registryAddress).instance;

        return Promise
          .all([
            registry.getAddress.call({}, [api.util.sha3('gavcoin'), 'A']),
            api.eth.accounts(),
            api.parity.accounts()
          ]);
      })
      .then(([address, addresses, accountsInfo]) => {
        accountsInfo = accountsInfo || {};
        console.log(`gavcoin was found at ${address}`);

        const contract = api.newContract(abis.gavcoin, address);

        this.setState({
          loading: false,
          address,
          contract,
          accountsInfo,
          instance: contract.instance,
          accounts: addresses.map((address) => {
            const info = accountsInfo[address] || {};

            return {
              address,
              name: info.name,
              uuid: info.uuid
            };
          })
        });

        api.subscribe('eth_blockNumber', this.onNewBlockNumber);
      })
      .catch((error) => {
        console.warn('attachInterface', error);
      });
  }
}
