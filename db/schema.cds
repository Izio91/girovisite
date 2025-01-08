namespace girovisite;

entity Header {
    key vpid     : String(10);
    key vctext   : String(30);
    key werks    : String(4);
    key vkorg    : String(4);
    key vtweg    : String(2);
    key spart    : String(2);
        driver1  : String(10);
        termCode : String(3);
        datfr    : Date;
        datto    : Date;
        active   : String(1);
        loevm    : String(1);
        erdat    : Date;
        erzet    : Time;
        ernam    : String(12);
        aedat    : Date;
        aezet    : Time;
        aenam    : String(12);
        details  : Association to many Detail
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
    key vpid      : String(10);
    key vppos     : String(3);
    key werks     : String(4);
        driver1   : String(10);
        kunnr     : String(10);
        datab     : Date;
        datbi     : Date;
        inactive  : String(1);
        kunwe     : String(10);
        dtabwe    : Date;
        dtbiwe    : Date;
        turno     : String(1);
        sequ      : String(3);
        monday    : String(3);
        tuesday   : String(3);
        wednesday : String(3);
        thursday  : String(3);
        friday    : String(3);
        saturday  : String(3);
        sunday    : String(3);
        dtfine    : String(8);
        erdat     : Date;
        erzet     : Time;
        ernam     : String(12);
        aedat     : Date;
        aezet     : Time;
        aenam     : String(12);
        header    : Association to one Header
                        on  header.vpid  = $self.vpid
                        and header.werks = $self.werks;
}

annotate Detail with @assert.unique: {uniqueKey: [
    vpid,
    vppos,
    werks
]};
