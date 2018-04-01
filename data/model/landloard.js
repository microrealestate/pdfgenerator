const mongoose = require('mongoose');
const {Bank, Contact} = require('./schemas');

const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = mongoose.Schema({
    landloardId: ObjectId,
    bank: Bank,
    stakeholder: {}, // Company or Person,
    contacts: [Contact],
    creationDate: Date
});

module.exports = mongoose.model('landloards', schema);