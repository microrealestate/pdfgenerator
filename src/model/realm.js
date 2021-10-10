const mongoose = require('mongoose');

const RealmSchema = mongoose.Schema({
  name: String,
  members: [
    {
      name: String,
      email: String,
      role: String,
      registered: Boolean,
    },
  ],
  addresses: [
    {
      street1: String,
      street2: String,
      zipCode: String,
      city: String,
      state: String,
      country: String,
    },
  ],
  bankInfo: {
    name: String,
    iban: String,
  },
  contacts: [
    {
      name: String,
      email: String,
      phone1: String,
      phone2: String,
    },
  ],
  isCompany: Boolean,
  companyInfo: {
    name: String,
    legalStructure: String,
    legalRepresentative: String,
    capital: Number,
    ein: String,
    dos: String,
    vatNumber: String,
  },
  thirdParties: {
    mailgun: {
      apiKey: String,
      domain: String,
      fromEmail: String,
      replyToEmail: String,
    },
    // b2: {
    //   applicationKeyId: String,
    //   applicationKey: String,
    // },
  },
  locale: String,
  currency: String,
});

module.exports = mongoose.model('Realm', RealmSchema);
