using { girovisiteSrv } from '../srv/service.cds';

annotate girovisiteSrv.Header with @UI.HeaderInfo: { TypeName: 'Header', TypeNamePlural: 'Headers', Title: { Value: vpid } };
annotate girovisiteSrv.Header with {
  ID @UI.Hidden @Common.Text: { $value: vpid, ![@UI.TextArrangement]: #TextOnly }
};
annotate girovisiteSrv.Header with @UI.Identification: [{ Value: vpid }];
annotate girovisiteSrv.Header with {
  vpid @title: 'VPID';
  vctext @title: 'VCTEXT';
  werks @title: 'WERKS';
  vkorg @title: 'VKORG';
  vtweg @title: 'VTWEG';
  spart @title: 'SPART';
  driver1 @title: 'DRIVER1';
  termCode @title: 'TERM CODE';
  datfr @title: 'DATFR';
  datto @title: 'DATTO';
  active @title: 'ACTIVE';
  loevm @title: 'LOEVM';
  erdat @title: 'ERDAT';
  erzet @title: 'ERZET';
  ernam @title: 'ERNAM';
  aedat @title: 'AEDAT';
  aezet @title: 'AEZET';
  aenam @title: 'AENAM'
};

annotate girovisiteSrv.Header with @UI.LineItem: [
    { $Type: 'UI.DataField', Value: vpid },
    { $Type: 'UI.DataField', Value: vctext },
    { $Type: 'UI.DataField', Value: werks },
    { $Type: 'UI.DataField', Value: vkorg },
    { $Type: 'UI.DataField', Value: vtweg },
    { $Type: 'UI.DataField', Value: spart },
    { $Type: 'UI.DataField', Value: driver1 },
    { $Type: 'UI.DataField', Value: termCode },
    { $Type: 'UI.DataField', Value: datfr },
    { $Type: 'UI.DataField', Value: datto },
    { $Type: 'UI.DataField', Value: active },
    { $Type: 'UI.DataField', Value: loevm },
    { $Type: 'UI.DataField', Value: erdat },
    { $Type: 'UI.DataField', Value: erzet },
    { $Type: 'UI.DataField', Value: ernam },
    { $Type: 'UI.DataField', Value: aedat },
    { $Type: 'UI.DataField', Value: aezet },
    { $Type: 'UI.DataField', Value: aenam }
];

annotate girovisiteSrv.Header with @UI.FieldGroup #Main: {
  $Type: 'UI.FieldGroupType', Data: [
    { $Type: 'UI.DataField', Value: vpid },
    { $Type: 'UI.DataField', Value: vctext },
    { $Type: 'UI.DataField', Value: werks },
    { $Type: 'UI.DataField', Value: vkorg },
    { $Type: 'UI.DataField', Value: vtweg },
    { $Type: 'UI.DataField', Value: spart },
    { $Type: 'UI.DataField', Value: driver1 },
    { $Type: 'UI.DataField', Value: termCode },
    { $Type: 'UI.DataField', Value: datfr },
    { $Type: 'UI.DataField', Value: datto },
    { $Type: 'UI.DataField', Value: active },
    { $Type: 'UI.DataField', Value: loevm },
    { $Type: 'UI.DataField', Value: erdat },
    { $Type: 'UI.DataField', Value: erzet },
    { $Type: 'UI.DataField', Value: ernam },
    { $Type: 'UI.DataField', Value: aedat },
    { $Type: 'UI.DataField', Value: aezet },
    { $Type: 'UI.DataField', Value: aenam }
  ]
};

annotate girovisiteSrv.Header with {
  details @Common.Label: 'Details'
};

annotate girovisiteSrv.Header with @UI.Facets: [
  { $Type: 'UI.ReferenceFacet', ID: 'Main', Label: 'General Information', Target: '@UI.FieldGroup#Main' }
];

annotate girovisiteSrv.Header with @UI.SelectionFields: [
  vpid
];

annotate girovisiteSrv.Detail with @UI.HeaderInfo: { TypeName: 'Detail', TypeNamePlural: 'Details', Title: { Value: vpid } };
annotate girovisiteSrv.Detail with {
  ID @UI.Hidden @Common.Text: { $value: vpid, ![@UI.TextArrangement]: #TextOnly }
};
annotate girovisiteSrv.Detail with @UI.Identification: [{ Value: vpid }];
annotate girovisiteSrv.Detail with {
  header @Common.ValueList: {
    CollectionPath: 'Header',
    Parameters    : [
      {
        $Type            : 'Common.ValueListParameterInOut',
        LocalDataProperty: header_ID, 
        ValueListProperty: 'ID'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'vpid'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'vctext'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'werks'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'vkorg'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'vtweg'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'spart'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'driver1'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'termCode'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'datfr'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'datto'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'active'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'loevm'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'erdat'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'erzet'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'ernam'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'aedat'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'aezet'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'aenam'
      },
    ],
  }
};
annotate girovisiteSrv.Detail with {
  vpid @title: 'VPID';
  vppos @title: 'VPPOS';
  werks @title: 'WERKS';
  driver1 @title: 'DRIVER1';
  kunnr @title: 'KUNNR';
  datar @title: 'DATAB';
  datbi @title: 'DATBI';
  inactive @title: 'INACTIVE';
  kunwe @title: 'KUNWE';
  dtabwe @title: 'DTABWE';
  dtbiwe @title: 'DTBIWE';
  turno @title: 'TURNO';
  sequ @title: 'SEQU';
  monday @title: 'MONDAY';
  tuesday @title: 'TUESDAY';
  wednesday @title: 'WEDNESDAY';
  thursday @title: 'THURSDAY';
  friday @title: 'FRIDAY';
  saturday @title: 'SATURDAY';
  sunday @title: 'SUNDAY';
  dtfine @title: 'DTFINE';
  erdat @title: 'ERDAT';
  erzet @title: 'ERZET';
  ernam @title: 'ERNAM';
  aedat @title: 'AEDAT';
  aezet @title: 'AEZET';
  aenam @title: 'AENAM'
};

annotate girovisiteSrv.Detail with @UI.LineItem: [
    { $Type: 'UI.DataField', Value: vpid },
    { $Type: 'UI.DataField', Value: vppos },
    { $Type: 'UI.DataField', Value: werks },
    { $Type: 'UI.DataField', Value: driver1 },
    { $Type: 'UI.DataField', Value: kunnr },
    { $Type: 'UI.DataField', Value: datar },
    { $Type: 'UI.DataField', Value: datbi },
    { $Type: 'UI.DataField', Value: inactive },
    { $Type: 'UI.DataField', Value: kunwe },
    { $Type: 'UI.DataField', Value: dtabwe },
    { $Type: 'UI.DataField', Value: dtbiwe },
    { $Type: 'UI.DataField', Value: turno },
    { $Type: 'UI.DataField', Value: sequ },
    { $Type: 'UI.DataField', Value: monday },
    { $Type: 'UI.DataField', Value: tuesday },
    { $Type: 'UI.DataField', Value: wednesday },
    { $Type: 'UI.DataField', Value: thursday },
    { $Type: 'UI.DataField', Value: friday },
    { $Type: 'UI.DataField', Value: saturday },
    { $Type: 'UI.DataField', Value: sunday },
    { $Type: 'UI.DataField', Value: dtfine },
    { $Type: 'UI.DataField', Value: erdat },
    { $Type: 'UI.DataField', Value: erzet },
    { $Type: 'UI.DataField', Value: ernam },
    { $Type: 'UI.DataField', Value: aedat },
    { $Type: 'UI.DataField', Value: aezet },
    { $Type: 'UI.DataField', Value: aenam },
    { $Type: 'UI.DataField', Label: 'Header', Value: header_ID }
];

annotate girovisiteSrv.Detail with @UI.FieldGroup #Main: {
  $Type: 'UI.FieldGroupType', Data: [
    { $Type: 'UI.DataField', Value: vpid },
    { $Type: 'UI.DataField', Value: vppos },
    { $Type: 'UI.DataField', Value: werks },
    { $Type: 'UI.DataField', Value: driver1 },
    { $Type: 'UI.DataField', Value: kunnr },
    { $Type: 'UI.DataField', Value: datar },
    { $Type: 'UI.DataField', Value: datbi },
    { $Type: 'UI.DataField', Value: inactive },
    { $Type: 'UI.DataField', Value: kunwe },
    { $Type: 'UI.DataField', Value: dtabwe },
    { $Type: 'UI.DataField', Value: dtbiwe },
    { $Type: 'UI.DataField', Value: turno },
    { $Type: 'UI.DataField', Value: sequ },
    { $Type: 'UI.DataField', Value: monday },
    { $Type: 'UI.DataField', Value: tuesday },
    { $Type: 'UI.DataField', Value: wednesday },
    { $Type: 'UI.DataField', Value: thursday },
    { $Type: 'UI.DataField', Value: friday },
    { $Type: 'UI.DataField', Value: saturday },
    { $Type: 'UI.DataField', Value: sunday },
    { $Type: 'UI.DataField', Value: dtfine },
    { $Type: 'UI.DataField', Value: erdat },
    { $Type: 'UI.DataField', Value: erzet },
    { $Type: 'UI.DataField', Value: ernam },
    { $Type: 'UI.DataField', Value: aedat },
    { $Type: 'UI.DataField', Value: aezet },
    { $Type: 'UI.DataField', Value: aenam },
    { $Type: 'UI.DataField', Label: 'Header', Value: header_ID }
  ]
};

annotate girovisiteSrv.Detail with {
  header @Common.Text: { $value: header.vpid, ![@UI.TextArrangement]: #TextOnly }
};

annotate girovisiteSrv.Detail with {
  header @Common.Label: 'Header'
};

annotate girovisiteSrv.Detail with @UI.Facets: [
  { $Type: 'UI.ReferenceFacet', ID: 'Main', Label: 'General Information', Target: '@UI.FieldGroup#Main' }
];

annotate girovisiteSrv.Detail with @UI.SelectionFields: [
  header_ID
];

