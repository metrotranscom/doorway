
/**
 * This object represents the item returned from the listings API. Except in
 * cases where properties are being accessed, it is preferred to use "any"
 * for the type of complex objects as they are always converted into strings
 * regardless.
 */
export class Listing {
  id: string
  assets: Array<Record<string, any>>
  unitsAvailable: number
  applicationDueDate: string | null
  applicationOpenDate: string
  name: string
  waitlistCurrentSize: number | null
  waitlistMaxSize: number | null
  isWaitListOpen: boolean
  status: "status"
  reviewOrderType: string
  publishedAt: string
  closedAt: string | null
  updatedAt: string | null
  countyCode: string
  city: string
  neighborhood: string | null
  reservedCommunityType?: { name: string } | null
  urlSlug: string
  unitsSummarized?: Array<Record<string, any>> | null
  images?: Array<Record<string, any>> | null
  listingMultiselectQuestions: Array<Record<string, any>> | null
  jurisdiction: { name: string, id: string }
  units?: Array<Record<string, any>> | null
  buildingAddress?: Record<string, any>
  features: Record<string, boolean>
  utilities: Record<string, boolean>
}
