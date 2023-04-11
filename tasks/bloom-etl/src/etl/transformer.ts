
function jsonOrNull(value: any): string | null {
  if (value == null)
    return null

  return JSON.stringify(value)
}

export const defaultMap = {
  id: "id",
  assets: (obj) => jsonOrNull(obj.assets),
  // household_size_min
  // household_size_max
  units_available: "unitsAvailable",
  application_due_date: "applicationDueDate",
  application_open_date: "applicationOpenDate",
  name: "name",
  waitlist_current_size: "waitlistCurrentSize",
  waitlist_max_size: "waitlistMaxSize",
  is_waitlist_open: (obj) => true, // not available on view=base but needed for sorting
  status: "status",
  review_order_type: "reviewOrderType",
  published_at: "publishedAt",
  closed_at: "closedAt",
  updated_at: (obj) => null, // not available on view=base but needed for sorting

  county: "countyCode",
  city: (obj) => obj.buildingAddress?.city,
  neighborhood: (obj) => null, // not available on view=base but needed for filtering
  reserved_community_type_name: (obj) => obj.reservedCommunityType?.name,

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

  /* not sure whether any of these are actually needed
  min_bedrooms
  max_bedrooms
  min_bathrooms
  max_bathrooms
  min_monthly_income_min
  max_monthly_income_min
  min_occupancy
  max_occupancy
  min_sq_feet
  max_sq_feet
  lowest_floor
  highest_floor
  */

  url_slug: "urlSlug",

  units_summarized: (obj) => jsonOrNull(obj.unitsSummarized),
  images: (obj) => jsonOrNull(obj.images),
  multiselect_questions: (obj) => jsonOrNull(obj.listingMultiselectQuestions),
  jurisdiction: (obj) => jsonOrNull(obj.jurisdiction),
  reserved_tommunity_type: (obj) => jsonOrNull(obj.reservedCommunityType),
  units: (obj) => jsonOrNull(obj.units),
  building_address: (obj) => jsonOrNull(obj.buildingAddress),
  features: (obj) => jsonOrNull(obj.features),
  utilities: (obj) => jsonOrNull(obj.utilities),
  
}

export class Transformer {
  map: any

  constructor(map: any) {
    this.map = map
  }

  private getMappedValue(key: string, value: any, obj: any): any {
    const type = typeof value

    switch (type) {
      case "string":
        return obj[value]
      case "function": 
        const func = value as Function
        return func(obj)
      default: throw new Error(`Unexpected map type [${type}]`)
    }
  }

  public mapObjToRow(obj: any): any {
    const row = {}

    for (const [key, value] of Object.entries(this.map)) {
      row[key] = this.getMappedValue(key, value, obj)
    }

    return row
  }
}
