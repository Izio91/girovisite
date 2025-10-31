"use strict";

module.exports = async (request, tx) => {
    let {
        attachment
    } = request.data;
    
    let dDate = new Date(),
        aLocaleDate = dDate.toLocaleDateString('it-IT').split("/"),
        sYear = aLocaleDate[2],
        sMonth = aLocaleDate[1].padStart(2, '0'),
        sDay = aLocaleDate[0].padStart(2, '0'),
        sDate = sYear + "-" + sMonth + "-" + sDay,
        sTime = dDate.toLocaleTimeString('it-IT'),
        sLogonName = request.req.authInfo.getEmail();
    sLogonName = !sLogonName ? '' : sLogonName.substring(0, 12);
    //Retrieve correct destination from ENV string and Package destination
    const service = await cds.connect.to(process.env['Destination_CloudIntegration']),
          serviceRequest = service.tx(request);
    // Perform request
    let oResult = await serviceRequest.post(process.env['Path_MASSIVE_IMPORT'], {"Attachment": attachment, "Ernam": sLogonName, "Aedat": sDate, "Aezet": sTime});
    
    return {
        status: 200,
        result: oResult,
        message: 'Executed'
    };
};