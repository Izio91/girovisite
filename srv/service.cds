using {girovisite as my} from '../db/schema.cds';

@path    : '/service/girovisite'
@requires: 'authenticated-user'
service girovisiteSrv {
  @readonly
  entity Header as projection on my.Header;

  @readonly
  entity Detail as projection on my.Detail;
}
