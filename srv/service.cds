using {girovisite as my} from '../db/schema.cds';


service girovisiteService
                          // @(requires: 'authenticated-user')
                          @(path: '/girovisiteService') {
  entity Header            as projection on my.Header;
  entity Detail            as projection on my.Detail;
  entity HeaderWithDetails as projection on my.HeaderWithDetails;
  // Functions
  function getWerks()  returns array of String;
  function getVkorg()  returns array of String;
  function getDriver() returns array of String;
  function getKunnr()  returns array of String;
  function getKunwe()  returns array of String;
}
