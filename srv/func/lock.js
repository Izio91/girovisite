"use strict";

module.exports = async (request, tx) => {
    let {
        vpid
    } = request.data,
        sLockedBy = request.req.authInfo.getEmail();
    
    sLockedBy = !sLockedBy ? '' : sLockedBy.substring(0,12);
    let updateQuery = UPDATE('Header')
        .set({ locked: true, lockedBy: sLockedBy, lockedAt: new Date(), aenam: sLockedBy })
        .where({ vpid: vpid });

    let aResult = await tx.run(updateQuery);
    return {
        status: 200,
        result: aResult,
        message: 'Executed'
    };
};
