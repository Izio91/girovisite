"use strict";

module.exports = async (request, tx) => {
    let vpid = request.req.query['vpid'],
        query = SELECT('locked, lockedBy, lockedAt').from('Header').where(`vpid = ${vpid}`),
        data = null;
        
    data = await tx.run(query);

    if (data.length === 0) {
        return {
            status: 400,
            currentUser: request.req.authInfo.getEmail(),
            message: "No data found for current vpid"
        };
    }

    return {
        status: 200,
        currentUser: request.req.authInfo.getEmail(),
        result: data
    };
        
};
