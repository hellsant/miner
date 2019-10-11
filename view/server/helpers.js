const moment = require('moment');
const helpers = {};

helpers.prettifyDate = timestamp => {
  return moment(timestamp).format('MMMM Do YYYY, h:mm:ss a');
};

helpers.ifCond = (v1, v2, options) => {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
};

helpers.inOutAmount = (key, from, amount) => {
  return (key == from) ? -amount : amount;
};

helpers.val = (v1, v2) => {
  return (v1 == v2) ? v1 : v2;
};
module.exports = helpers;