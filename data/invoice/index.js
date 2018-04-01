const path = require('path');
const fileUrl = require('file-url');
const db = require('../');
const config = require('../../lib/config');

const template_dir = config.TEMPLATES_DIRECTORY;

module.exports = {
    async get(params) {
        const data = await db.getRentsData(params);
        if (!data || !data.rents) {
            throw new Error(`data not found to generate document invoice with id=${params.id}`);
        }
        Object.assign(data, {
            cssUrl: fileUrl(path.join(template_dir, 'css', 'print.css')),
            logoUrl: fileUrl(path.join(template_dir, 'img', 'logo.png'))
        });
        return data;
    }
};