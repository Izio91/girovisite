using {girovisite as my} from '../db/schema.cds';


service girovisiteService @(requires: 'authenticated-user')@(path: '/girovisiteService') {
  entity Header            as projection on my.Header;
  entity Detail            as projection on my.Detail;
  entity HeaderWithDetails as projection on my.HeaderWithDetails;

  // Functions
  function getLogonName()                         returns array of String;
  function getWerks()                             returns array of String;
  function getVkorg()                             returns array of String;
  function getVtweg()                             returns array of String;
  function getSpart()                             returns array of String;
  action   getDriver(Customers: array of String)  returns array of String;
  action   getKunnr(Customers: array of String)   returns array of String;
  action   getKunwe(Customers: array of String)   returns array of String;
  function getLockStatus()                        returns array of String;
  function getDataForCSV()                        returns array of String;
  action   lock(vpid: String)                     returns array of String;
  action   unlock(vpid: String)                   returns array of String;
  action   massiveImport(attachment: LargeString) returns array of String;
}
