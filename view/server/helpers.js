const moment = require('moment');
const helpers = {};

helpers.prettifyDate = timestamp => {
  return moment(timestamp).format('MMMM Do YYYY, h:mm:ss a');
};

module.exports = helpers;