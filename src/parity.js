// Copyright 2016 Gavin Wood

const Api = require('@parity/api');

let api;

if (!window.ethereum) {
  api = window.parity.api;
} else {
  api = new Api(window.ethereum);
}

export {
  api
};
