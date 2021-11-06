const jwt = require('jsonwebtoken');
const logger = require('winston');

const needAccessToken = (accessTokenSecret) => {
  return (req, res, next) => {
    if (!req.headers.authorization) {
      return res.sendStatus(401);
    }

    const accessToken = req.headers.authorization.split(' ')[1];
    if (!accessToken) {
      return res.sendStatus(401);
    }

    try {
      const decoded = jwt.verify(accessToken, accessTokenSecret);
      req.user = decoded.account;
    } catch (err) {
      logger.warn(err);
      return res.sendStatus(401);
    }

    next();
  };
};

module.exports = {
  needAccessToken,
};
