const express = require('express');
const config = require('../config');
const { needAccessToken } = require('../utils/middlewares');
const Realm = require('../model/realm');
const templates = require('./templates');
const documents = require('./documents');

const routes = express.Router();
routes.use(needAccessToken(config.ACCESS_TOKEN_SECRET));
routes.use(async (req, res, next) => {
  const organizationId = req.headers.organizationid;
  if (!organizationId) {
    return res.sendStatus(403);
  }

  req.realm = (await Realm.findOne({ _id: organizationId }))?.toObject();
  if (req.realm) {
    req.realm._id = req.realm._id?.toString();
  }
  next();
});
routes.use('/templates', templates);
routes.use('/documents', documents);

module.exports = routes;
