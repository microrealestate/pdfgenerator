const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const config = require('./config');
const dataPicker = require('./datapicker');
const pdfEngine = require('./engine/chromeheadless');

const settings = {
    'view engine': ejs.renderFile,
    'pdf engine': pdfEngine
};
const templates_dir = config.TEMPLATES_DIRECTORY;
const tmp_dir = config.TEMPORARY_DIRECTORY;
const pdf_dir = config.PDF_DIRECTORY;

function set(key, value) {
    settings[key] = value;
}

async function start() {
    if (!fs.existsSync(pdf_dir)) {
        fs.mkdirSync(pdf_dir);
    }
    if (!fs.existsSync(tmp_dir)) {
        fs.mkdirSync(tmp_dir);
    }

    await settings['pdf engine'].start();
}

async function exit() {
    await settings['pdf engine'].exit();
}

async function generate(documentId, params) {
    const templateFile = path.join(templates_dir, `${documentId}.ejs`);
    const data = await dataPicker(documentId, params);
    const html = await new Promise((resolve, reject) => {
        settings['view engine'](templateFile, data, {root: templates_dir}, (err, html) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(html);
        });
    });
    return await settings['pdf engine'].generate(documentId, html, data.fileName);
}

module.exports = {
    set,
    start,
    exit,
    generate
};