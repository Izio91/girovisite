namespace girovisite;

entity Header {
    key vpid        : Integer;
    key vctext      : String(30);
    key werks       : String(4);
    key vkorg       : String(4);
    key vtweg       : String(2);
    key spart       : String(2);
        werksDescr  : String;
        driver1     : String(10);
        driverDescr : String;
        termCode    : String(3);
        datfr       : Date;
        datto       : Date;
        active      : String(1);
        loevm       : String(1);
        erdat       : Date;
        erzet       : Time;
        ernam       : String(12);
        aedat       : Date;
        aezet       : Time;
        aenam       : String(12);
        locked      : Boolean;
        lockedBy    : String;
        lockedAt    : DateTime;
        details     : Composition of many Detail
                          on  details.vpid  = $self.vpid
                          and details.werks = $self.werks;

}

annotate Header with @assert.unique: {uniqueKey: [
    vpid,
    vctext,
    werks,
    vkorg,
    vtweg,
    spart
]};


entity Detail {
    key vpid             : Integer;
    key vppos            : Integer;
    key werks            : String(4);
        driver1          : String(10);
        kunnr            : String(10);
        kunnrCompanyName : String;
        kunnrAddress     : String;
        datab            : Date;
        datbi            : Date;
        inactive         : String(1);
        kunwe            : String(10);
        kunweCompanyName : String;
        kunweAddress     : String;
        dtabwe           : Date;
        dtbiwe           : Date;
        turno            : String(1);
        sequ             : String(3);
        monday           : String(3);
        tuesday          : String(3);
        wednesday        : String(3);
        thursday         : String(3);
        friday           : String(3);
        saturday         : String(3);
        sunday           : String(3);
        dtfine           : String(8);
        erdat            : Date;
        erzet            : Time;
        ernam            : String(12);
        aedat            : Date;
        aezet            : Time;
        aenam            : String(12);
        header           : Association to one Header
                               on  header.vpid  = $self.vpid
                               and header.werks = $self.werks;
}

annotate Detail with @assert.unique: {uniqueKey: [
    vpid,
    vppos,
    werks
]};

view HeaderWithDetails as
    select distinct
        key t1.vpid, 
        key t1.werks, 
        key t2.vppos, 
            t1.vctext,
            t1.driver1,
            t1.termCode,
            t1.datfr,
            t1.datto,
            t2.kunnr,
            t2.inactive,
            t2.datab,
            t2.datbi,
            t2.kunwe,
            t2.dtabwe,
            t2.dtbiwe,
            t2.turno,
            t2.monday,
            t2.tuesday,
            t2.wednesday,
            t2.thursday,
            t2.friday,
            t2.saturday,
            t2.sunday,
            t1.vkorg,
            t1.vtweg,
            t1.spart,
            t2.dtfine,
            t1.active,
            t1.loevm,
            t1.erdat,
            t1.erzet,
            t1.ernam,
            t1.aedat,
            t1.aezet,
            t1.aenam,
            t1.locked,
            t1.lockedBy,
            t1.lockedAt
    from Header as t1
    left outer join Detail as t2
        on  t1.vpid  = t2.vpid
        and t1.werks = t2.werks
    order by t1.vpid asc ;
