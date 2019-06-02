const { URL } = require('url');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const logger = require('winston');
const moment = require('moment');
const config = require('../lib/config');
const Landloard = require('./model/landloard');
const Contract = require('./model/contract');

const ObjectId = mongoose.Types.ObjectId;

let connection, client, base_db;

process.on('SIGINT', async () => {
    exit();
});

async function start() {
    await start_db();
    await start_base_db();
}

async function exit() {
    await exit_db();
    await exit_base_db();
}

async function start_db() {
    if (!connection) {
        logger.debug(`db connecting to ${config.DB_URL}...`);
        connection = await mongoose.connect(config.DB_URL);
        logger.debug('db ready');
    }
}

async function exit_db() {
    if (connection) {
        logger.debug('db disconnecting...');
        await mongoose.disconnect();
        connection = null;
        logger.debug('db disconnected');
    }
}

async function start_base_db() {
    if (!client) {
        logger.debug(`db connecting to ${config.BASE_DB_URL}...`);
        const db_url = new URL(config.BASE_DB_URL);
        const db_name = db_url.pathname.slice(1);
        let origin = db_url.origin;
        if (origin == 'null') {
            origin = `${db_url.protocol}//${db_url.hostname}${db_url.port?`:${db_url.port}`:''}`;
        }
        client = await MongoClient.connect(origin);
        base_db = await client.db(db_name);
        logger.debug('db ready');
    }
}

async function exit_base_db() {
    logger.debug('db disconnecting...');
    if (client) {
        await client.close();
    }
    logger.debug('db disconnected');
}

async function updateTenant(tenantId) {
    const {contract, landloard} = await getContratLandloard(tenantId);
    if (landloard) {
        await Landloard.findOneAndUpdate(
            {landloardId: landloard.landloardId},
            landloard,
            {upsert:true}
        );
        logger.info(`${ landloard.stakeholder.name || landloard.stakeholder.lastName } updated in db`);
    }

    if (contract) {
        await Contract.findOneAndUpdate(
            {contractId: contract.contractId},
            contract,
            {upsert:true}
        );
        const stakeholder = contract.tenant.stakeholders[0];
        logger.info(`${ stakeholder.name || stakeholder.lastName } updated in db`);
    }
}

function nameToPerson(name) {
    if (!name) {
        return {firstName: '', lastName: ''};
    }
    const arr = name.split(' ');
    const [firstName, lastName=''] = arr;
    return {firstName, lastName};
}

async function getContratLandloard(tenantId) {
    const occupant = await base_db.collection('occupants').findOne({_id: ObjectId(tenantId)});
    if (!occupant) {
        throw new Error(`tenant ${tenantId} not found`);
    }
    const tenant = {
        stakeholders: [],
        contacts: []
    };

    const address = {
        street1: occupant.street1,
        city: occupant.city,
        zipCode: occupant.zipCode,
        country: occupant.country || 'FRANCE'
    };

    const manager = {
        firstName: nameToPerson(occupant.manager).firstName,
        lastName: nameToPerson(occupant.manager).lastName
    };

    if (occupant.isCompany) {
        tenant.stakeholders.push({
            name: occupant.name,
            manager,
            legalForm: occupant.legalForm,
            vatNumber: '',
            capital: occupant.capital,
            siret: occupant.siret,
            address
        });
    } else {
        const person = Object.assign({}, manager);
        person.address = address;
        tenant.stakeholders.push(person);
    }

    tenant.contacts = occupant.contacts.map(contact => {
        return {
            firstName: nameToPerson(contact.contact).firstName,
            lastName: nameToPerson(contact.contact).lastName,
            phones: contact.phone ? [contact.phone] : [],
            emails: contact.email ? [contact.email] : []
        };
    });

    let rents = [];
    if (occupant.rents.length) {
        rents = occupant.rents.map(rent => {
            rent.billingReference = `${moment(rent.term, 'YYYYMMDDHH').format('MM_YY_')}${occupant.reference}`,
            rent.total.payment = rent.total.payment || 0;
            rent.total.subTotal = rent.total.preTaxAmount + rent.total.charges - rent.total.discount + rent.total.debts;
            rent.total.newBalance = rent.total.grandTotal - rent.total.payment;
            return rent;
        });
    }

    const landloardId = ObjectId(occupant.realmId);
    const contract = {
        landloardId,
        contractId: occupant._id,
        tenant,
        beginDate: moment(occupant.beginDate, 'DD/MM/YYYY').toDate(),
        endDate: moment(occupant.endDate, 'DD/MM/YYYY').toDate(),
        rents
    };
    if (occupant.terminationDate) {
        contract.terminationDate = moment(occupant.terminationDate, 'DD/MM/YYYY').toDate();
    }

    const realm = await base_db.collection('realms').findOne({_id: ObjectId(occupant.realmId)});
    if (!realm) {
        return {contract, landloard: null};
    }
    const landloard = {
        landloardId,
        bank: {
            name: realm.bank,
            IBAN: realm.rib,
            BIC: ''
        },
        contacts: [{
            firstName: nameToPerson(realm.contact).firstName,
            lastName: nameToPerson(realm.contact).lastName,
            phones: realm.phone2 ? [realm.phone1, realm.phone2] : [realm.phone1],
            emails: [realm.email]
        }],
        creationDate: realm.creation
    };
    landloard.stakeholder = {
        address: {
            street1: realm.street1,
            street2: realm.street2,
            city: realm.city,
            zipCode: realm.zipCode,
            country: realm.country || 'FRANCE'
        }
    };
    if (realm.isCompany) {
        Object.assign(landloard.stakeholder, {
            name: realm.company,
            manager: {
                firstName: nameToPerson(realm.manager).firstName,
                lastName: nameToPerson(realm.manager).lastName
            },
            legalForm: realm.legalForm,
            vatNumber: realm.vatNumber,
            capital: realm.capital,
            siret: realm.rcs,
        });
    } else {
        Object.assign(landloard.stakeholder, {
            firstName: nameToPerson(realm.renter).firstName,
            lastName: nameToPerson(realm.renter).lastName,
        });
    }
    return {contract, landloard};
}

async function getRentsData(params) {
    await start();
    await updateTenant(params.id);
    const data = await Contract.findOne({contractId: params.id}, null, { lean: true });
    if (data) {
        const locale = params.locale || 'fr';
        data.today = moment().locale(locale).format('LL');
        if (data.rents) {
            data.rents = data.rents.filter(rent => rent.term === Number(params.term));
            data.beginDate = moment(data.beginDate).locale(locale).format('DD/MM/YYYY');
            data.endDate = moment(data.endDate).locale(locale).format('LL');
            if (data.terminationDate) {
                data.terminationDate = moment(data.terminationDate).locale(locale).format('LL');
            }
            data.rents.forEach(rent => {
                rent.period = moment(rent.term, 'YYYYMMDDHH').locale(locale).format('MMMM YYYY');
            });
        }
        if (data.landloardId) {
            data.landloard = await Landloard.findOne({landloardId: data.landloardId}, null, { lean: true });
            delete data.landloardId;
        }
        if (data.tenant.stakeholders[0].name) {
            data.fileName = `${data.tenant.stakeholders[0].name}-${params.term}`;
        } else {
            data.fileName = `${data.tenant.stakeholders[0].firstName}-${data.tenant.stakeholders[0].firstName}-${params.term}`;
        }
    }
    return data;
}

module.exports = {
    getRentsData
};