const mongoose = require('mongoose');

const DocumentSchema = mongoose.Schema({
  realmId: { type: String, ref: 'Realm' },
  tenantId: { type: String, ref: 'Tenant' },
  leaseId: { type: String, ref: 'Lease' },
  name: String,
  type: String,
  description: String,
  contents: Object,
  html: String,
});

module.exports = mongoose.model('Document', DocumentSchema);
