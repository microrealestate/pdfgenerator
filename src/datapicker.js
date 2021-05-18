const path = require('path');
const config = require('./config');

module.exports = async (templatId, params) => {
  const data = require(path.join(config.DATA_DIRECTORY, templatId));
  return await data.get(params);
};
