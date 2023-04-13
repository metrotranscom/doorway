
/**
 * This object represents the items returned from the listings API. Except in
 * cases where properties are being accessed, it is preferred to use "any"
 * for the type of complex objects as they are always converted into strings
 * regardless.
 */
export class Listing {
  id: string
  assets: Array<Record<string, any>>
  unitsAvailable: number
  applicationDueDate: string
  applicationOpenDate: string
  name: string
  waitlistCurrentSize: number
  waitlistMaxSize: number
  isWaitListOpen: boolean
  status: string
  reviewOrderType: string
  publishedAt: string
  closedAt: string
  updatedAt: string
  countyCode: string
  city: string
  neighborhood: string
  reservedCommunityType: { name: string }
  urlSlug: string
  unitsSummarized?: Array<Record<string, any>>
  images: Array<Record<string, any>>
  listingMultiselectQuestions: Array<Record<string, any>>
  jurisdiction: { name: string, id: string }
  units: Array<Record<string, any>>
  buildingAddress: { city: string }
  features: Record<string, boolean>
  utilities: Record<string, boolean>
}
