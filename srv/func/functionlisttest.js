"use strict";

module.exports = async (request, tx) => {
    let params = request.req.query;
    // Return the status code and message.
    return {
        status: 200,
        message: [`Hi there, this is functionlisttest!`,`You sent me these parameters: ${JSON.stringify(params)}`]
    };
};
