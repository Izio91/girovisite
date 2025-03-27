"use strict";

module.exports = async (request, tx) => {
    let {
        attachment
    } = request.data;

    //Retrieve correct destination from ENV string and Package destination
    const service = await cds.connect.to(process.env['Destination_CloudIntegration']),
          serviceRequest = service.tx(request);
    // Perform request
    let oResult = await serviceRequest.post(process.env['Path_MASSIVE_IMPORT'], {"Attachment": attachment});
    
    return {
        status: 200,
        result: oResult,
        message: 'Executed'
    };
};
