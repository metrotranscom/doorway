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
      bloom_jurisdiction?: string[]
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
    let uri = process.env.listingServiceUrl
    console.log("am i null")
    if (process.env.BLOOM_JURISDICTIONS != null) {
      console.log("not null wtf")
      uri = process.env.BACKEND_API_BASE + process.env.LISTINGS_WITH_BLOOM_QUERY
      console.log(uri)
      const jds = await fetchBloomJurisdictionsByName()
      const ids = jds.map((thing) => thing.id)
      params.bloom_jurisdiction = ids
      const response = await axios.get(uri, {
        params,
        paramsSerializer: (params) => {
          console.log("the params to hack on")
          console.log(qs.stringify(params))

          return qs.stringify(params)
        },
      })

      listings = response.data
      console.log("length of listings" + listings.length.toString())
      return listings[1].items
    }
    const response = await axios.get(uri, {
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

export async function fetchOpenListings() {
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

const bloomJurisdictions: Jurisdiction[] = []
// TODO: put this on the backend
export async function fetchBloomJurisdictionsByName() {
  try {
    if (bloomJurisdictions.length != 0) {
      console.log("already exists is big")
      return bloomJurisdictions
    }
    const jurisdictionNames = process.env.BLOOM_JURISDICTIONS
    const jurisdictionsArr = jurisdictionNames.split(",")
    // console.log("jurisdictionsArr.length")
    // console.log(jurisdictionsArr.length)
    // const jurisdictions_full = jurisdictionsArr.map(async (jurisdictionName) => {
    //   console.log(`${process.env.BLOOM_API_BASE}/jurisdictions/byName/${jurisdictionName}`)
    //   const jurisdictionRes = await axios.get(
    //     `${process.env.BLOOM_API_BASE}/jurisdictions/byName/${jurisdictionName}`
    //   )
    //   console.log(jurisdictionRes?.data)
    //   return jurisdictionRes?.data
    // })
    // bloomJurisdictions = jurisdictions_full
    for (const jurisdictionName of jurisdictionsArr) {
      const jurisdictionRes = await axios.get(
        `${process.env.BLOOM_API_BASE}/jurisdictions/byName/${jurisdictionName}`
      )
      jurisdiction = jurisdictionRes?.data
      console.log("pre-push length")
      console.log(bloomJurisdictions.length)
      bloomJurisdictions.push(jurisdiction)
      // var jurisdictionRes = await axios.get(
      //   `${process.env.backendApiBase}/jurisdictions/byName/${jurisdictionName}`
      // )
      // jurisdictions.push(jurisdictionRes?.data)
    }
    // const jurisdictionRes = await axios.get(
    //   `${process.env.backendApiBase}/jurisdictions/byName/${jurisdictionName}`
    // )
    // jurisdiction = jurisdictionRes?.data
    // return bloomJurisdictions
  } catch (error) {
    console.log("error = ", error)
    return []
  }

  return bloomJurisdictions
}
