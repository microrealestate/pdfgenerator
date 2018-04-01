const mongoose = require('mongoose');
const {Tenant} = require('./schemas');

const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = mongoose.Schema({
    contractId: ObjectId,
    landloardId: ObjectId,
    tenant: Tenant,
    type: String,
    billingReference: {type: String, uppercase:true},
    beginDate: Date,
    endDate: Date,
    terminationDate: Date,
    guaranty: Number,
    guarantyPayback: Number,
    discount: Number,
    vatRatio: Number,
    rents: {}
});

module.exports = mongoose.model('contracts', schema);