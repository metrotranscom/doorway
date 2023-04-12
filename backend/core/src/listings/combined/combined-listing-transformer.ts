import { Jurisdiction } from "../../jurisdictions/entities/jurisdiction.entity"
import { ListingMultiselectQuestion } from "../..//multiselect-question/entities/listing-multiselect-question.entity"
import { ReservedCommunityType } from "../../reserved-community-type/entities/reserved-community-type.entity"
import { Address } from "../../shared/entities/address.entity"
import { mapTo } from "../../shared/mapTo"
import { Unit } from "../../units/entities/unit.entity"
import { ListingFeatures } from "../entities/listing-features.entity"
import { ListingImage } from "../entities/listing-image.entity"
import { ListingUtilities } from "../entities/listing-utilities.entity"
import { Listing } from "../entities/listing.entity"
import { summarizeUnitsByTypeAndRent } from "../../shared/units-transformations"

/**
 * Converts raw table row from combined_listings view into a Listing object
 * REMOVE_WHEN_EXTERNAL_NOT_NEEDED
 */
export class CombinedListingTransformer {
  public transformAll(results): Listing[] {
    return results.map((result) => {
      return this.transform(result)
    })
  }

  public transform(result): Listing {
    const mapToOpts = { excludeExtraneousValues: true }

    const listing = new Listing()
    listing.id = result.id
    listing.assets = result.assets
    listing.unitsAvailable = result.units_available
    listing.applicationDueDate = result.application_due_date
    listing.applicationOpenDate = result.application_open_date
    listing.name = result.name
    listing.waitlistCurrentSize = result.waitlist_current_size
    listing.waitlistMaxSize = result.waitlist_max_size
    listing.status = result.status
    listing.reviewOrderType = result.review_order_type
    listing.publishedAt = result.published_at
    listing.closedAt = result.closed_at
    listing.updatedAt = result.updated_at
    listing.urlSlug = result.url_slug

    // jurisdiction
    listing.jurisdiction = mapTo(Jurisdiction, result.jurisdiction)

    // units
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listing.units = mapTo(Unit, result.units as Array<any>)

    // images
    listing.images =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.images == null ? null : mapTo(ListingImage, result.images as Array<any>, mapToOpts)

    // multiselect questions
    listing.listingMultiselectQuestions = mapTo(
      ListingMultiselectQuestion,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.multiselect_questions as Array<any>,
      mapToOpts
    )

    // reserved community type
    listing.reservedCommunityType = mapTo(
      ReservedCommunityType,
      result.reserved_community_type as object,
      mapToOpts
    )

    // building address
    listing.buildingAddress = 
      result.building_address == null 
        ? null 
        : mapTo(Address, result.building_address as object, mapToOpts)

    // features
    listing.features =
      result.features == null ? null : mapTo(ListingFeatures, result.features as object, mapToOpts)

    // utilities
    listing.utilities =
      result.utilities == null
        ? null
        : mapTo(ListingUtilities, result.utilities as object, mapToOpts)

    // unit summaries
    if (Array.isArray(listing.units)) {
      listing.unitsSummarized = {
        ...result.units_summarized,
        byUnitTypeAndRent: summarizeUnitsByTypeAndRent(listing.units, listing),
      }
    }

    return listing
  }
}
