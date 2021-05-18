const express = require('express');
const logger = require('winston');
const pdf = require('./pdf');
const Template = require('./model/template');

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

/**
 * route: /templates
 */
const _checkTemplateParameters = ({ name, type, contents, html }) => {
  const errors = [];
  if (!name) {
    errors.push('template name is missing');
  }
  if (!type) {
    errors.push('template type is missing');
  }
  if (!contents) {
    errors.push('template content is missing');
  }
  if (!html) {
    errors.push('template html is missing');
  }
  return errors;
};

const templatesApi = express.Router();
// TODO: move that at the apiRouter level when deprecated api will be removed
templatesApi.use((req, res, next) => {
  const organizationId = req.headers.organizationid;
  if (!organizationId) {
    return res.sendStatus(403);
  }
  next();
});

templatesApi.get('/', async (req, res) => {
  const organizationId = req.headers.organizationid;

  const templatesFound = await Template.find({
    organizationId,
  });
  if (!templatesFound) {
    return res.sendStatus(404);
  }

  res.status(200).json(templatesFound);
});

templatesApi.get('/:id', async (req, res) => {
  const organizationId = req.headers.organizationid;
  const templateId = req.params.id;

  if (!templateId) {
    return res.sendStatus(422);
  }

  const templateFound = await Template.findOne({
    _id: templateId,
    organizationId,
  });
  if (!templateFound) {
    return res.sendStatus(404);
  }

  res.status(200).json(templateFound);
});

templatesApi.post('/', async (req, res) => {
  const organizationId = req.headers.organizationid;

  const errors = _checkTemplateParameters(req.body);
  if (errors.length) {
    return res.status(422).json({ errors });
  }

  const { name, description = '', contents, html } = req.body || {};
  const createdTemplate = await Template.create({
    organizationId,
    name,
    description,
    contents,
    html,
  });

  res.status(201).json(createdTemplate);
});

templatesApi.put('/', async (req, res) => {
  const organizationId = req.headers.organizationid;

  let errors = _checkTemplateParameters(req.body);
  if (!req.body._id) {
    errors = ['template id is missing', ...errors];
  }
  if (errors.length) {
    return res.status(422).json({ errors });
  }

  const { _id, name, description = '', contents, html } = req.body || {};
  const updatedTemplate = await Template.findOneAndReplace(
    {
      _id,
      organizationId,
    },
    {
      organizationId,
      name,
      description,
      contents,
      html,
    },
    { new: true }
  );

  if (!updatedTemplate) {
    return res.sendStatus(404);
  }

  res.status(201).json(updatedTemplate);
});

templatesApi.delete('/:id', async (req, res) => {
  const organizationId = req.headers.organizationid;
  const templateId = req.params.id;

  const foundDocument = await Template.findOneAndDelete({
    organizationId,
    _id: templateId,
  });

  if (!foundDocument) {
    return res.sendStatus(404);
  }

  res.sendStatus(204);
});

/**
 * route: /documents
 */
const documentsApi = express.Router();
// TODO: move that at the apiRouter level when deprecated api will be removed
documentsApi.use((req, res, next) => {
  const organizationId = req.headers.organizationid;
  if (!organizationId) {
    return res.sendStatus(403);
  }
  next();
});

documentsApi.post('/', (req, res) => {
  const organizationId = req.headers.organizationid;
  const dataSet = req.body || []; // [{ templateId, data: {key, value}}]

  // TODO: to implement
  let documentsCreated = [];

  res.status(201).json(documentsCreated);
});

documentsApi.get('/:id', (req, res) => {
  const organizationId = req.headers.organizationid;
  const documentId = req.params.id;

  // TODO: to implement
  let documentCreated = {};

  res.status(201).json(documentCreated);
});

const apiRouter = express.Router();
apiRouter.use('/', deprecatedApi);
apiRouter.use('/templates', templatesApi);
apiRouter.use('/documents', documentsApi);

module.exports = apiRouter;
