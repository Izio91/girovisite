"use strict";

module.exports = async (request, tx) => {
    const serviceS4_HANA = await cds.connect.to(process.env['Destination_OData_S4HANA']);
    const serviceRequestS4_HANA = serviceS4_HANA.tx(request);
    const oResultVkorg = await serviceRequestS4_HANA.get(process.env['Path_API_VKORG']);
    return { status: 200, result: oResultVkorg, message: 'Executed' };
};
