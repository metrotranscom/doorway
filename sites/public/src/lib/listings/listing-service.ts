import {
  ListingFilterParams,
  ListingMapMarker,
  ListingsService,
  ListingViews,
  PaginatedListing,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { ListingQueryBuilder } from "./listing-query-builder"

export const searchListings = async (
  qb: ListingQueryBuilder,
  limit: number | "all" = "all",
  page = 1,
  listingsService: ListingsService
): Promise<PaginatedListing> => {
  let results = Promise.resolve({
    items: [],
    meta: {
      currentPage: 0,
      itemCount: 0,
      itemsPerPage: 0,
      totalItems: 0,
      totalPages: 0,
    },
  })

  const params: {
    view: ListingViews
    limit: number | "all"
    page: number
    filter: ListingFilterParams[]
  } = {
    view: ListingViews.base,
    limit: limit,
    page: page,
    filter: qb.getFilterParams(),
  }

  try {
    const response = await listingsService.listCombined(params)
    results = response
  } catch (e) {
    console.log("ListingService.searchListings error: ", e)
  }

  return results
}

export const searchMapMarkers = async (
  qb: ListingQueryBuilder,
  listingsService: ListingsService
): Promise<ListingMapMarker[]> => {
  const params: {
    limit: number | "all"
    filter: ListingFilterParams[]
  } = {
    limit: "all",
    filter: qb.getFilterParams(),
  }

  try {
    const response = await listingsService.mapMarkers(params)
    return response
  } catch (e) {
    console.log("ListingService.searchMapMarkers error: ", e)
  }
}
