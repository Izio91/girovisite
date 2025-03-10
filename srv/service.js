"use strict";

const { tx } = require('@sap/cds');

async function performRequest(srv, request, path) {
    try {
        // Start a transaction to execute the external request handler function defined in the file at 'path'.
        const result = await srv.transaction(async tx => {
            console.log('REQUIRE: ', path);
            return require(path)(request, tx);  // Load and call the function from the specified file.
        });

        console.log("RESULT: ", result);  // No need to 'await' here since `result` is not a Promise.

        // If the result contains an error status, return an error response to the client.
        if ([500, 403, 422].includes(result.status)) {
            return request.error(result);  // Return an error response to the client.
        }

        // If no errors, return the successful result to the client.
        return request.reply(result);

    } catch (error) {
        console.log(error);
        await tx.rollback(error);
        return request.error({
            code: error.status || 500,
            message: error.message || 'An unexpected error occurred'
        });
    }
}

module.exports = function (srv) {
    srv.on('getWerks', '*', async request => {
        await performRequest(srv, request, './func/getWerks');
    });

    srv.on('getVkorg', '*', async request => {
        await performRequest(srv, request, './func/getVkorg');
    });

    srv.on('getVtweg', '*', async request => {
        await performRequest(srv, request, './func/getVtweg');
    });

    srv.on('getSpart', '*', async request => {
        await performRequest(srv, request, './func/getSpart');
    });

    srv.on('getDriver', '*', async request => {
        await performRequest(srv, request, './func/getDriver');
    });

    srv.on('getKunnr', '*', async request => {
        await performRequest(srv, request, './func/getKunnr');
    });

    srv.on('getKunwe', '*', async request => {
        await performRequest(srv, request, './func/getKunwe');
    });
}