// Copyright 2016 Gavin Wood

import React, { Component } from 'react';

import { CircularProgress } from 'material-ui';

import styles from './loading.css';

export default class Loading extends Component {
  render () {
    return (
      <div className={ styles.loading }>
        <CircularProgress size={ 120 } thickness={ 7 } />
      </div>
    );
  }
}
