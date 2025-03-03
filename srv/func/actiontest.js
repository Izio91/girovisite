"use strict";

module.exports = async (request, tx) => {
    // Extract payload data from the incoming request.
    let {
        data
    } = request.data.payload;
    
    // Return the status code and message.
    return {
        status: 201,
        message: `Hi there, this is actiontest! You sent me: ${data}`
    };
};
