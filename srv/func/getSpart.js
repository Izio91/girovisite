"use strict";

module.exports = async (request, tx) => {
    const serviceS4_HANA = await cds.connect.to(process.env['Destination_OData_S4HANA']);
    const serviceRequestS4_HANA = serviceS4_HANA.tx(request);
    const oResultSpart = await serviceRequestS4_HANA.get(process.env['Path_API_SPART']);
    const uniqueSpart = [
        ...new Set(oResultSpart.map(item => item.Division))
      ].map(division => ({ Division: division }));
    return { status: 200, result: uniqueSpart, message: 'Executed' };
};
