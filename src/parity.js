// Copyright 2016 Gavin Wood

import Api from '@parity/api';

const ethereumProvider = window.ethereum;
let api = window.parity.api;

if (!ethereumProvider) {
  console.warn('Unable to locate EthereumProvider, fallback to window.parity');
  api = window.parity.api;
} else {
  api = new Api(ethereumProvider);
  console.log('Created API from window.ethereum provider');
}

export {
  api
};
