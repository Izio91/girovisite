"use strict";

module.exports = async (request, tx) => {
    const serviceS4_HANA = await cds.connect.to(process.env['Destination_OData_S4HANA']);
    const serviceRequestS4_HANA = serviceS4_HANA.tx(request);
    const pageSize = 100; // Limit per batch

    let sFilters = request.req.query['filter'];
    let data = [];
    let offset = 0;
    let batchData;

    let query = SELECT('vpid,vctext,driver1,termCode,datfr,datto,kunnr,datab,datbi,kunwe,dtabwe,dtbiwe,turno,monday,tuesday,wednesday,thursday,friday,saturday,sunday,vkorg,vtweg,spart,dtfine,active,loevm').from('HeaderWithDetails');

    // Apply filters if available
    if (sFilters) {
        sFilters = sFilters.replaceAll("eq", "=")
                           .replaceAll("lt", "<")
                           .replaceAll("le", "<=")
                           .replaceAll("gt", ">")
                           .replaceAll("ge", ">=");

        query.where(sFilters);  // Ensure this correctly applies the filter
    }

    // Fetch all records using pagination
    do {
        let paginatedQuery = query.limit(pageSize, offset);
        batchData = await tx.run(paginatedQuery);
        data = [...data, ...batchData];
        offset += pageSize;
    } while (batchData.length === pageSize); // Continue until fewer than 100 records are found
    
    if (data.length === 0) {
        return {
            status: 400,
            currentUser: request.req.authInfo.getLogonName(),
            message: "No data found"
        };
    }

    // Extract unique drivers, customers (kunnr), and ship-to parties (kunwe)
    const extractUnique = (field) => [...new Set(data.map(item => item[field]).filter(val => val !== null))];

    let aDriver = extractUnique('driver1').map(driver => `Customer eq '${driver}'`);
    let aKunnr = extractUnique('kunnr').map(kunnr => `Customer eq '${kunnr}'`);
    let aKunwe = extractUnique('kunwe').map(kunwe => `Customer eq '${kunwe}'`);

    // Function to split arrays into chunks of 50
    const chunkArray = (arr, size) => {
        return arr.reduce((acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), []);
    };

    // Function to fetch API data in batches
    const fetchBatchedData = async (apiPath, filterArray) => {
        let results = [];
        for (const batch of chunkArray(filterArray, 25)) {
            const response = await serviceRequestS4_HANA.get(apiPath + '&$filter=' + batch.join(" or "));
            results = [...results, ...response];
        }
        return results;
    };

    // Fetch and enrich data
    if (aDriver.length > 0) {
        const oResultDriver = await fetchBatchedData(process.env['Path_API_DRIVER'], aDriver);
        data = data.map(item => ({
            ...item,
            SortField: oResultDriver.find(customer => customer.Customer === item.driver1)?.SortField || null
        }));
    }

    if (aKunnr.length > 0) {
        const oResultKunnr = await fetchBatchedData(process.env['Path_API_KUNNR'], aKunnr);
        data = data.map(item => ({
            ...item,
            KunnrCustomerName: oResultKunnr.find(customer => customer.Customer === item.kunnr)?.CustomerName || null
        }));
    }

    if (aKunwe.length > 0) {
        const oResultKunwe = await fetchBatchedData(process.env['Path_API_KUNWE'], aKunwe);
        data = data.map(item => ({
            ...item,
            KunweCustomerName: oResultKunwe.find(customer => customer.Customer === item.kunwe)?.CustomerName || null,
            StreetName: oResultKunwe.find(customer => customer.Customer === item.kunwe)?.StreetName || null,
            PostalCode: oResultKunwe.find(customer => customer.Customer === item.kunwe)?.PostalCode || null,
            CityName: oResultKunwe.find(customer => customer.Customer === item.kunwe)?.CityName || null,
            BusinessPartnerGrouping: oResultKunwe.find(customer => customer.Customer === item.kunwe)?.BusinessPartnerGrouping || null,
            CustomerGroup: oResultKunwe.find(customer => customer.Customer === item.kunwe)?.CustomerGroup || null,
            CustomerConditionGroup2: oResultKunwe.find(customer => customer.Customer === item.kunwe)?.CustomerConditionGroup2 || null
        }));
    }

    // Convert date format from "yyyy-mm-dd" to "dd/mm/yyyy"
    const formatDate = (dateString) => {
        if (!dateString) return null;
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
    };

    data = data.map(item => ({
        ...item,
        datfr: formatDate(item.datfr),
        datto: formatDate(item.datto),
        datab: formatDate(item.datab),
        datbi: formatDate(item.datbi),
        dtabwe: formatDate(item.dtabwe),
        dtbiwe: formatDate(item.dtbiwe),
        dtfine: formatDate(item.dtfine)
    }));

    return {
        status: 200,
        currentUser: request.req.authInfo.getLogonName(),
        result: data
    };
        
};
