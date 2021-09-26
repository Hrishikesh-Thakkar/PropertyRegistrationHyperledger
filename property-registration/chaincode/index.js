'use strict';

const userContract = require('./userContract.js')
const registrarContract = require('./registrarContract.js');
module.exports.userContract = userContract;
module.exports.registrarContract = registrarContract;
module.exports.contracts = [userContract,registrarContract];
