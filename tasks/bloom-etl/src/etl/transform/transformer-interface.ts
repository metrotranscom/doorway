import {  Listing } from "../../types"

export interface TransformerInterface {
  //mapListingToRow(listing: Listing): any
  mapAll(listings: Array<Listing>): Array<object>
}
