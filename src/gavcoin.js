// Copyright 2016 Gavin Wood

import ReactDOM from 'react-dom';
import React from 'react';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import Application from './Application';

import '../assets/fonts/Roboto/font.css';
import './style.css';
import './index.html';

ReactDOM.render(
  <Application />,
  document.querySelector('#container')
);
