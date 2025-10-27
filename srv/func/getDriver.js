"use strict";

module.exports = async (request, tx) => {
    const serviceS4_HANA = await cds.connect.to(process.env['Destination_OData_S4HANA']);
    const serviceRequestS4_HANA = serviceS4_HANA.tx(request);
    // Function to split arrays into chunks of 25
    const chunkArray = (arr, size) => {
        return arr.reduce((acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), []);
    };
    const fetchBatchedData = async (apiPath, filterArray) => {
        let results = [];
        let response = [];
        if (filterArray.length > 0) {
            for (const batch of chunkArray(filterArray, 25)) {
                response = await serviceRequestS4_HANA.get(apiPath + '&$filter=' + batch.join(" or ")); 
            }
        } else {
            response = await serviceRequestS4_HANA.get(apiPath);
        }
        results = [...results, ...response];
        return results;
    };

    let { Customers } = request.data,
        aDriver = Customers? Customers.map(driver => `Customer eq '${driver}'`): [];
    const oResultDriver = await fetchBatchedData(process.env['Path_API_DRIVER'], aDriver);
    return { status: 200, result: oResultDriver, message: 'Executed' };
};
