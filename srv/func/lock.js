"use strict";

module.exports = async (request, tx) => {
    let {
        vpid
    } = request.data,
        sLockedBy = request.req.authInfo.getLogonName();

    let updateQuery = UPDATE('Header')
        .set({ locked: true, lockedBy: sLockedBy, lockedAt: new Date() })
        .where({ vpid: vpid });

    let aResult = await tx.run(updateQuery);
    return {
        status: 200,
        result: aResult,
        message: 'Executed'
    };
};
