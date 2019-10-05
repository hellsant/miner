const moment = require('moment');
const helpers = {};

helpers.prettifyDate = timestamp => {
  return moment(timestamp).format('MMMM Do YYYY, h:mm:ss a');
};

helpers.ifCond = (v1, v2, options) => {
  if(v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
};

module.exports = helpers;