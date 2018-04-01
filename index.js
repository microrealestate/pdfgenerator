const express = require('express');
const expressWinston = require('express-winston');
const logger = require('winston');
const pdf = require('./lib/pdf');
const config = require('./lib/config');

async function exit(code=0) {
    await pdf.exit();
    process.exit(code);
}

process.on('SIGINT', async () => {
    exit(0);
});

(async () => {
    // configure default logger
    logger.remove(logger.transports.Console);
    logger.add(logger.transports.Console, {
        level: config.LOGGER_LEVEL,
        colorize: true
    });

    logger.debug('starting rest API...');
    const app = express();

    // Express log through out winston
    app.use(expressWinston.logger({
        transports: [
            new logger.transports.Console({
                json: false,
                colorize: true
            })
        ],
        meta: false, // optional: control whether you want to log the meta data about the request (default to true)
        msg: String, //'HTTP {{req.method}} {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
        expressFormat: true, // Use the default Express/morgan request formatting, with the same colors. Enabling this will override any msg and colorStatus if true. Will only output colors on transports with colorize set to true
        colorStatus: true // Color the status code, using the Express/morgan color palette (default green, 3XX cyan, 4XX yellow, 5XX red). Will not be recognized if expressFormat is true
        //ignoreRoute: function( /*req, res*/ ) {
        //    return false;
        //} // optional: allows to skip some log messages based on request and/or response
    }));

    app.use(expressWinston.errorLogger({
        transports: [
            new logger.transports.Console({
                json: false,
                colorize: true
            })
        ]
    }));

    app.get('/pdfgenerator/:document/:id/:term', async (req, res) => {
        try {
            const pdfFile = await pdf.generate(req.params.document, req.params);
            res.download(pdfFile);
        } catch(exc) {
            logger.error(exc);
            res.sendStatus(404);
        }
    });

    try {
        await pdf.start();

        // Run server
        const http_port = config.PORT;
        await app.listen(http_port)
            .on('error', (error) => {
                throw new Error(error);
            });
        logger.debug(`Rest API listening on port ${http_port}`);
        logger.debug('Rest API ready');
        logger.info('PdfGenerator ready');
    } catch (exc) {
        logger.error(exc.message);
        exit(1);
    }
})();

