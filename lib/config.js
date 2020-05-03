const path = require('path');

const root_dir = path.join(__dirname, '..');

module.exports = {
    LOGGER_LEVEL: process.env.LOGGER_LEVEL || 'debug',
    PORT: process.env.PORT || 8082,
    DB_URL: process.env.MONGO_URL || process.env.DB_URL || 'mongodb://localhost/pdfdb',
    BASE_DB_URL: process.env.MONGO_URL || process.env.BASE_DB_URL || 'mongodb://localhost/sampledb',
    DATA_DIRECTORY: process.env.PDF_DIRECTORY || path.join(root_dir, '/data'),
    TEMPLATES_DIRECTORY: process.env.TEMPLATES_DIRECTORY || path.join(root_dir, '/templates'),
    TEMPORARY_DIRECTORY: process.env.TEMPORARY_DIRECTORY || path.join(root_dir, '/tmp'),
    PDF_DIRECTORY: process.env.PDF_DIRECTORY || path.join(root_dir, '/pdf_documents')
};