const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

const PropertySchema = mongoose.Schema({
  realmId: { type: ObjectId, ref: 'Realm' },

  name: String,
  location: String,
  phone: String,
  type: String,
  building: String,
  level: String,

  surface: Number,
  expense: Number,
  price: Number,

  occupant: ObjectId,
  occupantLabel: String,
});

module.exports = mongoose.model('Property', PropertySchema);
