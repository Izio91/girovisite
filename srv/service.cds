using {girovisite as my} from '../db/schema.cds';



service girovisiteService 
// @(requires: 'authenticated-user')
@(path    : '/girovisiteService')
 {
  entity Header as projection on my.Header;
  entity Detail as projection on my.Detail;
}
