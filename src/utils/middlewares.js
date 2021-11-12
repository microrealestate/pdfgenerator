const jwt = require('jsonwebtoken');
const logger = require('winston');

const needAccessToken = (accessTokenSecret) => {
  return (req, res, next) => {
    if (!req.headers.authorization) {
      logger.warn('accessToken not passed in the request');
      return res.sendStatus(401);
    }

    const accessToken = req.headers.authorization.split(' ')[1];
    if (!accessToken) {
      logger.warn('accessToken not passed in the request');
      logger.debug(req.headers.authorization);
      return res.sendStatus(401);
    }

    try {
      const decoded = jwt.verify(accessToken, accessTokenSecret);
      req.user = decoded.account;
    } catch (error) {
      logger.warn(error);
      return res.sendStatus(401);
    }

    next();
  };
};

module.exports = {
  needAccessToken,
};
