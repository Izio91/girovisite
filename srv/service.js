"use strict";

const { tx } = require('@sap/cds');

async function performRequest(srv, request, path) {
    try {
        // Start a transaction to execute the external request handler function defined in the file at 'path'.
        const result = await srv.transaction(async tx => {
            return require(path)(request, tx);  // Load and call the function from the specified file.
        });

        // If the result contains an error status, return an error response to the client.
        if ([500, 403, 422].includes(result.status)) {
            return request.error(result);  // Return an error response to the client.
        }

        // If no errors, return the successful result to the client.
        return request.reply(result);

    } catch (error) {
        return request.error({
            code: error.status || 500,
            message: error.message || 'An unexpected error occurred'
        });
    }
}

module.exports = function (srv) {
    srv.before('CREATE', 'Header', async request => {
        const db = cds.transaction(request);

        // Fetch the next value from the sequence
        const result = await db.run(`SELECT "HEADER_VPID".NEXTVAL FROM DUMMY`);
        const nVpid = result[0][`HEADER_VPID.NEXTVAL`];
        var sLogonName = request.req.authInfo.getLogonName();
        sLogonName = !sLogonName ? '' : sLogonName.substring(0, 12);
        request.data.vpid = nVpid;
        request.data.ernam = sLogonName;
        request.data.aenam = sLogonName;

        // Assign the same vpid to all associated Details
        if (request.data.details) {
            request.data.details.forEach(detail => {
                detail.vpid = nVpid;
                detail.vppos = parseInt(detail.vppos);  // Ensure vppos is an integer;
            });
        }
    });

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

    srv.on('getDataForCSV', '*', async request => {
        await performRequest(srv, request, './func/getDataForCSV');
    });

    srv.on('lock', '*', async request => {
        await performRequest(srv, request, './func/lock');
    });

    srv.on('unlock', '*', async request => {
        await performRequest(srv, request, './func/unlock');
    });

    srv.on('getLockStatus', '*', async request => {
        await performRequest(srv, request, './func/getLockStatus');
    });
}