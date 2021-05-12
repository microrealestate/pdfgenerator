const path = require('path');

const root_dir = path.join(__dirname, '..');

module.exports = {
  LOGGER_LEVEL: process.env.LOGGER_LEVEL || 'debug',
  PRODUCTIVE: process.env.NODE_ENV === 'production',
  PORT: process.env.PORT || 8082,
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost/sampledb',
  DATA_DIRECTORY: process.env.PDF_DIRECTORY || path.join(root_dir, '/data'),
  TEMPLATES_DIRECTORY:
    process.env.TEMPLATES_DIRECTORY || path.join(root_dir, '/templates'),
  TEMPORARY_DIRECTORY:
    process.env.TEMPORARY_DIRECTORY || path.join(root_dir, '/tmp'),
  PDF_DIRECTORY:
    process.env.PDF_DIRECTORY || path.join(root_dir, '/pdf_documents'),
};
