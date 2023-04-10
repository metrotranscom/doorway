import { Listing } from "../entities/listing.entity"
import { QueryRunner, SelectQueryBuilder } from "typeorm"
import { Pagination } from "nestjs-typeorm-paginate"
import { CombinedListingTransformer } from "./combined-listing-transformer"
import { ListingFilterParams } from "../dto/listing-filter-params"
import { addFilters } from "../../shared/query-filter"
import { combinedListingFilterTypeToFieldMap } from "./filter-type-to-field-map"
import { OrderByFieldsEnum } from "../types/listing-orderby-enum"
import { OrderParam } from "../../applications/types/order-param"
import { HttpException, HttpStatus } from "@nestjs/common"

type OrderByConditionData = {
  orderBy: string
  orderDir: "DESC" | "ASC"
  nulls?: "NULLS LAST" | "NULLS FIRST"
}

export class CombinedListingsQueryBuilder extends SelectQueryBuilder<any> {
  limitValue?: number | "all"
  pageValue?: number
  addUnitSummaryFlag?: boolean

  private static shouldPaginate(limit: number | "all", page: number) {
    return limit !== "all" && limit > 0 && page > 0
  }

  private static getOrderByCondition(
    orderBy: OrderByFieldsEnum,
    orderDir: OrderParam
  ): OrderByConditionData {
    switch (orderBy) {
      case OrderByFieldsEnum.mostRecentlyUpdated:
        return { orderBy: "updated_at", orderDir }
      case OrderByFieldsEnum.status:
        return { orderBy: "status", orderDir }
      case OrderByFieldsEnum.name:
        return { orderBy: "name", orderDir }
      case OrderByFieldsEnum.waitlistOpen:
        return { orderBy: "is_waitlist_open", orderDir }
      case OrderByFieldsEnum.unitsAvailable:
        return { orderBy: "units_available", orderDir }
      case OrderByFieldsEnum.mostRecentlyClosed:
        return {
          orderBy: "closed_at",
          orderDir,
          nulls: "NULLS LAST",
        }
      case OrderByFieldsEnum.mostRecentlyPublished:
        return {
          orderBy: "published_at",
          orderDir,
          nulls: "NULLS LAST",
        }
      // not sure what listings.marketingType refers to?
      //case OrderByFieldsEnum.marketingType:
      //  return { orderBy: "listings.marketingType", orderDir }
      case OrderByFieldsEnum.applicationDates:
      case undefined:
        // Default to ordering by applicationDates (i.e. applicationDueDate
        // and applicationOpenDate) if no orderBy param is specified.
        return { orderBy: "application_due_date", orderDir }
      default:
        throw new HttpException(
          `OrderBy parameter not recognized or not yet implemented.`,
          HttpStatus.NOT_IMPLEMENTED
        )
    }
  }

  public addSearchByListingNameCondition(searchName?: string) {
    if (searchName) {
      this.andWhere(`name ILIKE :search`, { search: `%${searchName}%` })
    }
    return this
  }

  /**
   * Override the super method to substitute a hard-coded value for countSql.
   * This may be a breaking change if any other counts are needed against more
   * complex queries, but is necessary without an Alias.  Can potentially be 
   * made unnecessary by manuallying injecting an Alias and metadata
   * 
   * @param queryRunner 
   * @returns number
   */
  protected async executeCountQuery(
    queryRunner: QueryRunner,
  ): Promise<number> {
    const countSql = "COUNT(*)"

    const results = await this.clone()
        .orderBy()
        .groupBy()
        .offset(undefined)
        .limit(undefined)
        .skip(undefined)
        .take(undefined)
        .select(countSql, "cnt")
        .setOption("disable-global-order")
        .loadRawResults(queryRunner)

    if (!results || !results[0] || !results[0]["cnt"]) return 0

    return parseInt(results[0]["cnt"])
  }

  addFilters(filters?: ListingFilterParams[]) {
    if (!filters) {
      return this
    }
    addFilters<Array<ListingFilterParams>, typeof combinedListingFilterTypeToFieldMap>(
      filters,
      combinedListingFilterTypeToFieldMap,
      this
    )
    return this
  }

  addOrderConditions(orderBy?: Array<OrderByFieldsEnum>, orderDir?: Array<OrderParam>) {
    let orderByConditionDataArray = []
    if (!orderDir || !orderBy) {
      orderByConditionDataArray = [
        CombinedListingsQueryBuilder.getOrderByCondition(
          OrderByFieldsEnum.applicationDates,
          OrderParam.ASC
        ),
      ]
    } else {
      for (let i = 0; i < orderDir.length; i++) {
        orderByConditionDataArray.push(
          CombinedListingsQueryBuilder.getOrderByCondition(orderBy[i], orderDir[i])
        )
      }
    }

    for (const orderByCondition of orderByConditionDataArray) {
      this.addOrderBy(orderByCondition.orderBy, orderByCondition.orderDir, orderByCondition.nulls)
    }

    return this
  }

  paginate(limit?: number | "all", page?: number) {
    this.limitValue = limit
    this.pageValue = page

    if (CombinedListingsQueryBuilder.shouldPaginate(limit, page)) {
      // Calculate the number of listings to skip (because they belong to lower page numbers).
      const offset = (page - 1) * (limit as number)
      // Add the limit and offset to the inner query, so we only do the full
      // join on the listings we want to show.
      this.offset(offset).limit(limit as number)
    }
    return this
  }

  public async getManyAndCount(): Promise<[Listing[], number]> {
    const results = await this.getRawMany()
    const count = await this.getCount()

    const listings: Listing[] = []

    console.log("results retrieved")
    console.log(`Listings fetched: ${results.length}`)
    console.log(`Total listings available: ${count}`)

    // Our version of typeorm is too old to use any of the transformers available in newer versions
    // We'll do it ourselves instead
    const transformer = new CombinedListingTransformer()
    
    results.forEach( (result) => {
      listings.push(transformer.transform(result))
    })

    return [listings, count]
  }

  public async getManyPaginated(): Promise<Pagination<Listing>> {
    let listings: Listing[], count: number
    [listings, count] = await this.getManyAndCount()
    
    //*
    const shouldPaginate = CombinedListingsQueryBuilder.shouldPaginate(
      this.limitValue,
      this.pageValue
    )
    
    const itemsPerPage = shouldPaginate ? (this.limitValue as number) : listings.length
    const totalItems = shouldPaginate ? count : listings.length
    const currentPage = shouldPaginate ? this.pageValue : 1

    const paginationInfo = {
      currentPage: currentPage,
      itemCount: listings.length,
      itemsPerPage: itemsPerPage,
      totalItems: totalItems,
      totalPages: Math.ceil(totalItems / itemsPerPage), // will be 1 if no pagination
    }
    
    return {
      items: listings,
      meta: paginationInfo,
      // nestjs-typeorm-paginate leaves these empty if no route is defined
      // This matches what other paginated endpoints, such as the applications
      // service, currently return.
      links: {
        first: "",
        previous: "",
        next: "",
        last: "",
      },
    }
  }
}
