import { Listing } from "src/types"

function jsonOrNull(value: any): string | null {
  if (value == null) return "null"

  return JSON.stringify(value)
}

type resolveFunction = (listing: Listing) => string | number | boolean | null

export const defaultMap = {
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

  /* probably not needed, but keeping just in case
  min_monthly_rent: (obj) => {
    if (!Array.isArray(obj.units)) {
      return null
    }

    let min = 99999999999

    obj.units.forEach( (unit) => {
      const rent = parseFloat(unit.monthlyRent) // it's a string for some reason

      if (rent < min) {
        min = rent
      }
    })

    return min
  },

  max_monthly_rent: (obj) => {
    if (!Array.isArray(obj.units)) {
      return null
    }

    let max = 0

    obj.units.forEach( (unit) => {
      const rent = parseFloat(unit.monthlyRent) // it's a string for some reason

      if (rent > max) {
        max = rent
      }
    })

    return max
  },
  */

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

export class Transformer {
  map: any

  constructor(map: any) {
    this.map = map
  }

  private getMappedValue(key: string, value: any, obj: any): any {
    const type = typeof value

    // eslint complained when I used a switch here
    if (type == "string") {
      return obj[value as string]
    }

    if (type == "function") {
      return (value as resolveFunction)(obj)
    }
    
    throw new Error(`Unexpected map type [${type}]`)
  }

  public mapAll(listings: Array<any>): Array<any> {
    const rows = listings.map((listing) => {
      return this.mapObjToRow(listing)
    })

    console.log(`Transform Results: ${rows.length} listings converted into table rows`)

    return rows
  }

  public mapObjToRow(obj: any): any {
    const row = {}

    for (const [key, value] of Object.entries(this.map)) {
      row[key] = this.getMappedValue(key, value, obj)
    }

    return row
  }
}
