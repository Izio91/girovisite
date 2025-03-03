using {girovisite as my} from '../db/schema.cds';


service girovisiteService
                          // @(requires: 'authenticated-user')
                          @(path: '/girovisiteService') {
  entity Header as projection on my.Header;
  entity Detail as projection on my.Detail;
  entity HeaderWithDetails as projection on my.HeaderWithDetails;

  action   actiontest(payload : actiontestPayload) returns array of String;
  function functiontest(data : String)             returns array of String;
  function functionlisttest()                      returns array of String;

  type actiontestPayload {
    data : String;
  };
}
