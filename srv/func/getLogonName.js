"use strict";

module.exports = async (request, tx) => {
    var sLogonName = request.req.authInfo.getLogonName();
    sLogonName = !sLogonName ? '' : sLogonName.substring(0, 12);
    return { status: 200, result: sLogonName, message: 'Executed' };
};
