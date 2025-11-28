"use strict";

module.exports = async (request, tx) => {
    const pageSize = 100; // Limit per batch

    let sFilters = request.req.query['filter'];
    let data = [];
    let offset = 0;
    let batchData;

    let query = SELECT('vpid,vctext,driver1,termCode,datfr,datto,vppos,kunnr,datab,datbi,kunwe,dtabwe,dtbiwe,turno,monday,tuesday,wednesday,thursday,friday,saturday,sunday,vkorg,vtweg,spart,dtfine,active,loevm').from('HeaderWithDetails');

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
            currentUser: request.req.authInfo.getEmail(),
            message: "No data found"
        };
    }

    return {
        status: 200,
                currentUser: request.req.authInfo.getEmail(),
                        result: data
                            };
                                    
                                    };
