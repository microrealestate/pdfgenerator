const moment = require('moment');
const path = require('path');
const fileUrl = require('file-url');
const db = require('../');
const config = require('../../lib/config');

const template_dir = config.TEMPLATES_DIRECTORY;

module.exports = {
    async get(params) {
        const data = await db.getRentsData(params);

        if (!data || !data.tenant || !data.tenant.rents) {
            throw new Error(`data not found to generate document rentcall with id=${params.id}`);
        }

        const locale = params.locale || 'fr';
        const momentToday = moment().locale(locale);
        const momentTerm = moment(params.term, 'YYYYMMDDHH').locale(locale);
        data.today = momentToday.format('LL');
        const dueDate = moment(momentTerm).add(10, 'days');
        const dueDay = dueDate.isoWeekday();
        if (dueDay === 6) {
            dueDate.subtract(1, 'days');
        } else if (dueDay === 7) {
            dueDate.add(1, 'days');
        }
        if (dueDate.isSameOrBefore(momentToday)) {
            const today = moment(momentTerm);
            const day = today.isoWeekday();
            if (day === 6) {
                today.subtract(1, 'days');
            } else if (day === 7) {
                today.add(1, 'days');
            }
            data.today = today.format('LL');
        }
        data.tenant.rents.forEach(rent => {
            rent.dueDate = dueDate.locale(locale).format('LL');
        });

        data.cssUrl = fileUrl(path.join(template_dir, 'css', 'print.css'));
        data.logoUrl = fileUrl(path.join(template_dir, 'img', 'logo.png'));
        return data;
    }
};

