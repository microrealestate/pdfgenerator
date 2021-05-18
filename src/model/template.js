const mongoose = require('mongoose');

const TemplateSchema = mongoose.Schema({
  organizationId: String,
  name: String,
  type: String,
  description: String,
  contents: Object,
  html: String,
});

module.exports = mongoose.model('Template', TemplateSchema);
