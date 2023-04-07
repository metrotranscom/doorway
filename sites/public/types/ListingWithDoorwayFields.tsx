import { Listing } from "@bloom-housing/backend-core/types"

export interface ListingWithDoorwayFields extends Listing {
  /**  */
  isBloomListing?: boolean
}
