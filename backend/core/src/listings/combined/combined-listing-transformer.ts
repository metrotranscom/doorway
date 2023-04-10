import { Jurisdiction } from "../../jurisdictions/entities/jurisdiction.entity";
import { ListingMultiselectQuestion } from "../..//multiselect-question/entities/listing-multiselect-question.entity";
import { ReservedCommunityType } from "../../reserved-community-type/entities/reserved-community-type.entity";
import { Address } from "../../shared/entities/address.entity";
import { mapTo } from "../../shared/mapTo";
import { Unit } from "../../units/entities/unit.entity";
import { ListingFeatures } from "../entities/listing-features.entity";
import { ListingImage } from "../entities/listing-image.entity";
import { ListingUtilities } from "../entities/listing-utilities.entity";
import { Listing } from "../entities/listing.entity";

export class CombinedListingTransformer {

    public transform(result):Listing {
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
  
        // jurisdiction
        listing.jurisdiction = mapTo(Jurisdiction, result.jurisdiction)
  
        // units
        listing.units = mapTo(Unit, result.units as Array<any>)
  
        // unit summaries
  
        // images
        listing.images = (result.images == null) ? null : mapTo(ListingImage, result.images as Array<any>, mapToOpts)
  
        // multiselect questions
        listing.listingMultiselectQuestions = mapTo(ListingMultiselectQuestion, result.multiselect_questions as Array<any>, mapToOpts)
  
        // reserved community type
        listing.reservedCommunityType = mapTo(ReservedCommunityType, result.reserved_community_type as object, mapToOpts)
  
        // building address
        listing.buildingAddress = mapTo(Address, result.building_address as object, mapToOpts)
  
        // features
        listing.features = (result.features == null) ? null : mapTo(ListingFeatures, result.features as object, mapToOpts)
  
        // utilities
        listing.utilities = (result.utilities == null) ? null : mapTo(ListingUtilities, result.utilities as object, mapToOpts)

        return listing
    }
}
