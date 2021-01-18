const mongoose = require('mongoose');
const logger = require('winston');
const moment = require('moment');
const config = require('../lib/config');

const Tenant = require('./model/tenant');
let connection;

process.on('SIGINT', async () => {
    exit();
});

async function start() {
    if (!connection) {
        logger.debug(`db connecting to ${config.MONGO_URL}...`);
        connection = await mongoose.connect(config.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        logger.debug('db ready');
    }
}

async function exit() {
    if (connection) {
        logger.debug('db disconnecting...');
        await mongoose.disconnect();
        connection = null;
        logger.debug('db disconnected');
    }
}

async function getRentsData(params) {
    const { locale = 'fr', id: tenantId, term } = params;
    const dbTenant = await Tenant.findOne({ _id: tenantId })
        .populate('realmId')
        .populate('properties.propertyId');

    if (!dbTenant) {
        throw new Error(`tenant ${tenantId} not found`);
    }

    const landlord = dbTenant.realmId;
    landlord.name = landlord.isCompany ? landlord.companyInfo.name : landlord.contacts[0].name;

    let rents = [];
    if (dbTenant.rents.length) {
        rents = dbTenant.rents
            .filter(rent => rent.term === Number(term))
            .map(rent => ({
                ...rent,
                period: moment(rent.term, 'YYYYMMDDHH').locale(locale).format('MMMM YYYY'),
                billingReference: `${moment(rent.term, 'YYYYMMDDHH').format('MM_YY_')}${dbTenant.reference}`,
                total: {
                    ...rent.total,
                    payment: rent.total.payment || 0,
                    subTotal: rent.total.preTaxAmount + rent.total.charges - rent.total.discount + rent.total.debts,
                    newBalance: rent.total.grandTotal - rent.total.payment
                }
            }));
    }

    const tenant = {
        name: dbTenant.isCompany ? dbTenant.company : dbTenant.name,
        isCompany: dbTenant.isCompany,
        companyInfo: {
            name: dbTenant.company,
            capital: dbTenant.capital,
            ein:dbTenant.siret,
            dos: dbTenant.rcs,
            vatNumber: dbTenant.vatNumber,
            legalRepresentative: dbTenant.manager
        },
        addresses: [{
            street1: dbTenant.street1,
            street2: dbTenant.street2,
            city: dbTenant.city,
            state: dbTenant.state,
            country: dbTenant.country
        }],
        contract: {
            name: dbTenant.contract,
            beginDate: moment(dbTenant.beginDate, 'DD/MM/YYYY').locale(locale).format('L'),
            endDate: moment(dbTenant.endDate, 'DD/MM/YYYY').locale(locale).format('LL'),
            properties: dbTenant.properties.reduce((acc, { propertyId }) => {
                acc.push(propertyId);
                return acc;
            }, [])
        },
        rents
    };
    if (dbTenant.terminationDate) {
        tenant.contact.terminationDate = moment(dbTenant.terminationDate, 'DD/MM/YYYY').locale(locale).format('LL');
    }

    return {
        today: moment().locale(locale).format('LL'),
        fileName: `${dbTenant.name}-${term}`,
        tenant,
        landlord
    };
}

module.exports = {
    start,
    getRentsData
};