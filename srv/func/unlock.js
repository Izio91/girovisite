"use strict";

module.exports = async (request, tx) => {
    let {
        vpid
    } = request.data;

    let updateQuery = UPDATE('Header')
        .set({ locked: false, lockedBy: null, lockedAt: null })
        .where({ vpid: vpid });

    let aResult = await tx.run(updateQuery);
    return {
        status: 200,
        result: aResult,
        message: 'Executed'
    };
};
