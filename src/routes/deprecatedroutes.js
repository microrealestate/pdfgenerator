const express = require('express');
const logger = require('winston');
const pdf = require('../pdf');

// TODO: remove this deprecated api
const deprecatedApi = express.Router();
deprecatedApi.get('/:document/:id/:term', async (req, res) => {
  try {
    const pdfFile = await pdf.generate(req.params.document, req.params);
    res.download(pdfFile);
  } catch (exc) {
    logger.error(exc.message ? exc.message : exc);
    res.sendStatus(404);
  }
});

const routes = express.Router();
routes.use('/', deprecatedApi);

module.exports = routes;
