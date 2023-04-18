import { Listing } from "../../types"

function jsonOrNull(value: any): string | null {
  if (value == null) return "null"

  return JSON.stringify(value)
}

export type ResolveFunction = (listing: Listing) => string | number | boolean | null
export type MapValue = string | ResolveFunction
export type RecordMap = Record<string, MapValue>
export type RecordValue = string | number | boolean | object

export const defaultMap: RecordMap = {
  id: "id",
  assets: (listing: Listing) => jsonOrNull(listing.assets),
  // household_size_min
  // household_size_max
  units_available: "unitsAvailable",
  application_due_date: "applicationDueDate",
  application_open_date: "applicationOpenDate",
  name: "name",
  waitlist_current_size: "waitlistCurrentSize",
  waitlist_max_size: "waitlistMaxSize",
  is_waitlist_open: (listing: Listing) => true, // not available on view=base but needed for sorting
  status: "status",
  review_order_type: "reviewOrderType",
  published_at: "publishedAt",
  closed_at: "closedAt",
  updated_at: (listing: Listing) => null, // not available on view=base but needed for sorting

  county: "countyCode",
  city: (listing: Listing) => listing.buildingAddress?.city,
  neighborhood: (listing: Listing) => null, // not available on view=base but needed for filtering
  reserved_community_type_name: (listing: Listing) => listing.reservedCommunityType?.name,

  url_slug: "urlSlug",

  units_summarized: (listing: Listing) => jsonOrNull(listing.unitsSummarized),
  images: (listing: Listing) => jsonOrNull(listing.images),
  multiselect_questions: (listing: Listing) => jsonOrNull(listing.listingMultiselectQuestions),
  jurisdiction: (listing: Listing) => jsonOrNull(listing.jurisdiction),
  reserved_community_type: (listing: Listing) => jsonOrNull(listing.reservedCommunityType),
  units: (listing: Listing) => jsonOrNull(listing.units),
  building_address: (listing: Listing) => jsonOrNull(listing.buildingAddress),
  features: (listing: Listing) => jsonOrNull(listing.features),
  utilities: (listing: Listing) => jsonOrNull(listing.utilities),
}
