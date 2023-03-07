import { useContext, useEffect, useState } from "react"
import axios from "axios"
import qs from "qs"
import { useRouter } from "next/router"
import { ApplicationStatusProps, isInternalLink } from "@bloom-housing/ui-components"
import {
  EnumListingFilterParamsComparison,
  EnumListingFilterParamsStatus,
  Jurisdiction,
  Listing,
  ListingFilterParams,
  OrderByFieldsEnum,
  OrderParam,
} from "@bloom-housing/backend-core/types"
import { ParsedUrlQuery } from "querystring"
import { AppSubmissionContext } from "./applications/AppSubmissionContext"
import { getListingApplicationStatus } from "./helpers"

export const useRedirectToPrevPage = (defaultPath = "/") => {
  const router = useRouter()

  return (queryParams: ParsedUrlQuery = {}) => {
    const redirectUrl =
      typeof router.query.redirectUrl === "string" && isInternalLink(router.query.redirectUrl)
        ? router.query.redirectUrl
        : defaultPath
    const redirectParams = { ...queryParams }
    if (router.query.listingId) redirectParams.listingId = router.query.listingId

    return router.push({ pathname: redirectUrl, query: redirectParams })
  }
}

export const useFormConductor = (stepName: string) => {
  const context = useContext(AppSubmissionContext)
  const conductor = context.conductor

  conductor.stepTo(stepName)

  useEffect(() => {
    conductor.skipCurrentStepIfNeeded()
  }, [conductor])
  return context
}

export const useGetApplicationStatusProps = (listing: Listing): ApplicationStatusProps => {
  const [props, setProps] = useState({ content: "", subContent: "" })

  useEffect(() => {
    if (!listing) return

    const { content, subContent } = getListingApplicationStatus(listing)

    setProps({ content, subContent })
  }, [listing])

  return props
}

export async function fetchBaseListingData({
  additionalFilters,
  orderBy,
  orderDir,
}: {
  additionalFilters?: ListingFilterParams[]
  orderBy?: OrderByFieldsEnum[]
  orderDir?: OrderParam[]
}) {
  let listings = []
  try {
    const { id: jurisdictionId } = await fetchJurisdictionByName()

    if (!jurisdictionId) {
      return listings
    }
    let filter: ListingFilterParams[] = [
      {
        $comparison: EnumListingFilterParamsComparison["="],
        jurisdiction: jurisdictionId,
      },
    ]

    if (additionalFilters) {
      filter = filter.concat(additionalFilters)
    }
    const params: {
      view: string
      limit: string
      filter: ListingFilterParams[]
      orderBy?: OrderByFieldsEnum[]
      orderDir?: OrderParam[]
    } = {
      view: "base",
      limit: "all",
      filter,
    }
    if (orderBy) {
      params.orderBy = orderBy
    }
    if (orderDir) {
      params.orderDir = orderDir
    }
    const response = await axios.get(process.env.listingServiceUrl, {
      params,
      paramsSerializer: (params) => {
        return qs.stringify(params)
      },
    })

    listings = response.data?.items
  } catch (e) {
    console.log("fetchBaseListingData error: ", e)
  }

  return listings
}
export async function fetchBaseMultiListingData({
  additionalFilters,
  orderBy,
  orderDir,
}: {
  additionalFilters?: ListingFilterParams[]
  orderBy?: OrderByFieldsEnum[]
  orderDir?: OrderParam[]
}) {
  let listings = []
  try {
    const jds = await fetchJurisdictionsByName()

    if (jds.length == 0) {
      return listings
    }
    let filter: ListingFilterParams[] = [
      {
        $comparison: EnumListingFilterParamsComparison["="],
      },
    ]

    if (additionalFilters) {
      filter = filter.concat(additionalFilters)
    }
    const params: {
      view: string
      limit: string
      filter: ListingFilterParams[]
      orderBy?: OrderByFieldsEnum[]
      orderDir?: OrderParam[]
    } = {
      view: "base",
      limit: "all",
      filter,
    }
    if (orderBy) {
      params.orderBy = orderBy
    }
    if (orderDir) {
      params.orderDir = orderDir
    }
    const response = await axios.get(process.env.listingServiceUrl, {
      params,
      paramsSerializer: (params) => {
        return qs.stringify(params)
      },
    })

    listings = response.data?.items

    console.log("liann params 1")
    console.log(qs.stringify(params))
    // const jds = await fetchJurisdictionsByName()
    for (const multiJurisdiction of jds) {
      const { id: jurisdictionId } = multiJurisdiction
      params.filter[0].jurisdiction = jurisdictionId
      console.log("url")
      console.log(process.env.listingServiceUrl)
      const response = await axios.get(process.env.listingServiceUrl, {
        params,
        paramsSerializer: (params) => {
          return qs.stringify(params)
        },
      })
      // console.log(
      //   "request for " +
      //     jurisdictionId +
      //     " adding this may items" +
      //     response.data?.items.length +
      //     typeof response.data?.items
      // )
      listings = listings.concat(response.data?.items)
    }
  } catch (e) {
    console.log("fetchBaseListingData error: ", e)
  }

  return listings
}

export async function fetchOpenListings() {
  if (process.env.JURISDICTIONS != null) {
    return await fetchBaseMultiListingData({
      additionalFilters: [
        {
          $comparison: EnumListingFilterParamsComparison["="],
          status: EnumListingFilterParamsStatus.active,
        },
      ],
      orderBy: [OrderByFieldsEnum.mostRecentlyPublished],
      orderDir: [OrderParam.DESC],
    })
  }
  return await fetchBaseListingData({
    additionalFilters: [
      {
        $comparison: EnumListingFilterParamsComparison["="],
        status: EnumListingFilterParamsStatus.active,
      },
    ],
    orderBy: [OrderByFieldsEnum.mostRecentlyPublished],
    orderDir: [OrderParam.DESC],
  })
}

export async function fetchClosedListings() {
  if (process.env.JURISDICTIONS != null) {
    return await fetchBaseMultiListingData({
      additionalFilters: [
        {
          $comparison: EnumListingFilterParamsComparison["="],
          status: EnumListingFilterParamsStatus.closed,
        },
      ],
      orderBy: [OrderByFieldsEnum.mostRecentlyClosed],
      orderDir: [OrderParam.DESC],
    })
  }

  return await fetchBaseListingData({
    additionalFilters: [
      {
        $comparison: EnumListingFilterParamsComparison["="],
        status: EnumListingFilterParamsStatus.closed,
      },
    ],
    orderBy: [OrderByFieldsEnum.mostRecentlyClosed],
    orderDir: [OrderParam.DESC],
  })
}

let jurisdiction: Jurisdiction | null = null

export async function fetchJurisdictionByName() {
  try {
    if (jurisdiction) {
      return jurisdiction
    }

    const jurisdictionName = process.env.jurisdictionName
    const jurisdictionRes = await axios.get(
      `${process.env.backendApiBase}/jurisdictions/byName/${jurisdictionName}`
    )
    jurisdiction = jurisdictionRes?.data
  } catch (error) {
    console.log("error = ", error)
  }

  return jurisdiction
}
const jurisdictions: Jurisdiction[] = []

export async function fetchJurisdictionsByName() {
  try {
    if (jurisdictions.length != 0) {
      console.log("already exists is big")
      return jurisdictions
    }
    const jurisdictionNames = process.env.JURISDICTIONS
    const jurisdictionsArr = jurisdictionNames.split(",")
    for (const jurisdictionName of jurisdictionsArr) {
      const jurisdictionRes = await axios.get(
        `${process.env.backendApiBase}/jurisdictions/byName/${jurisdictionName}`
      )
      jurisdiction = jurisdictionRes?.data
      jurisdictions.push(jurisdiction)
      // var jurisdictionRes = await axios.get(
      //   `${process.env.backendApiBase}/jurisdictions/byName/${jurisdictionName}`
      // )
      // jurisdictions.push(jurisdictionRes?.data)
    }
    // const jurisdictionRes = await axios.get(
    //   `${process.env.backendApiBase}/jurisdictions/byName/${jurisdictionName}`
    // )
    // jurisdiction = jurisdictionRes?.data
    return jurisdictions
  } catch (error) {
    console.log("error = ", error)
    return []
  }

  return jurisdictions
}
