using { girovisite as my } from '../db/schema.cds';

@path: '/service/girovisite'
@requires: 'authenticated-user'
service girovisiteSrv {
  @odata.draft.enabled
  entity Header as projection on my.Header;
  @odata.draft.enabled
  entity Detail as projection on my.Detail;
}