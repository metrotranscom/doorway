import { Listing } from "../../types"
import { MapValue, RecordMap, ResolveFunction, RecordValue } from "./map"
import { TransformerInterface } from "./transformer-interface"

export class DefaultTransformer implements TransformerInterface {
  map: RecordMap

  constructor(map: RecordMap) {
    this.map = map
  }

  private getMappedValue(key: string, value: MapValue, obj: Listing): RecordValue {
    const type = typeof value

    // eslint complained when I used a switch here
    if (type == "string") {
      return obj[value as string]
    }

    if (type == "function") {
      return (value as ResolveFunction)(obj)
    }
  }

  public mapAll(listings: Array<Listing>): Array<object> {
    const rows = listings.map((listing) => {
      return this.mapListingToRow(listing)
    })

    console.log(`Transform Results: ${rows.length} listings converted into table rows`)

    return rows
  }

  public mapListingToRow(listing: Listing): any {
    const row = {}

    for (const [key, value] of Object.entries(this.map)) {
      row[key] = this.getMappedValue(key, value, listing)
    }

    return row
  }
}
