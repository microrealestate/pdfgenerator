const mongoose = require('mongoose');

const Address = mongoose.Schema({
    street1: String,
    street2: {type: String, default: ''},
    city: String,
    zipCode: String,
    country: String
});

const Person = mongoose.Schema({
    gender: {type: String, default: '', required: true},
    firstName: String,
    lastName: String,
    address: Address
});

const Company = mongoose.Schema({
    name: String,
    manager: Person,
    legalForm: String,
    vatNumber: String,
    capital: Number,
    siret: String,
    address: Address,
    isCompany: {type: Boolean, default: true, required: true}
});

const Contact = mongoose.Schema({
    gender: {type: String, default: '', required: true},
    firstName: String,
    lastName: String,
    phones: [String],
    emails: [String]
});

const Bank = mongoose.Schema({
    name: String,
    IBAN: {type: String, uppercase: true},
    BIC: {type: String, uppercase: true}
});

const Tenant = mongoose.Schema({
    stakeholders: [],  // Person or Company
    contacts: [Contact],
});

module.exports = {
    Address,
    Person,
    Company,
    Contact,
    Bank,
    Tenant
};