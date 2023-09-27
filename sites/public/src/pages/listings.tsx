import React from "react"
import Head from "next/head"
import { t } from "@bloom-housing/ui-components"
import { MetaTags } from "../components/shared/MetaTags"
import ListingsSearchCombined, {
  locations,
} from "../components/listings/search/ListingsSearchCombined"
import { FormOption } from "../components/listings/search/ListingsSearchModal"
import { runtimeConfig } from "../lib/runtime-config"
import { fetchJurisdictionsByName } from "../lib/hooks"
import { Jurisdiction } from "@bloom-housing/backend-core/types"

import Layout from "../layouts/application"

export interface ListingsProps {
  jurisdictions: Jurisdiction[]
  listingsEndpoint: string
  googleMapsApiKey: string
  initialSearch?: string
  bedrooms: FormOption[]
  bathrooms: FormOption[]
  locations: FormOption[]
}

export default function ListingsPage(props: ListingsProps) {
  const pageTitle = `${t("pageTitle.rent")} - ${t("nav.siteTitle")}`
  const metaDescription = t("pageDescription.welcome")
  const metaImage = "" // TODO: replace with hero image
  let searchString = props.initialSearch || ""
  const url = new URL(document.location.toString())
  const searchParam = url.searchParams.get("search")

  // override the search value if present in url
  if (searchParam) {
    searchString = searchParam
  }
  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <MetaTags title={t("nav.siteTitle")} image={metaImage} description={metaDescription} />
      <ListingsSearchCombined
        jurisdictions={props.jurisdictions}
        listingsEndpoint={props.listingsEndpoint}
        googleMapsApiKey={props.googleMapsApiKey}
        searchString={searchString}
        bedrooms={props.bedrooms}
        bathrooms={props.bathrooms}
        counties={props.locations}
      />
    </Layout>
  )
}

export async function getServerSideProps() {
  const jurisList = runtimeConfig.getJurisdictionName()
  const jurisdictions = await fetchJurisdictionsByName(runtimeConfig.getBackendApiBase(), jurisList)
  return {
    props: {
      jurisdictions,
      listingsEndpoint: runtimeConfig.getListingServiceUrl(),
      googleMapsApiKey: runtimeConfig.getGoogleMapsApiKey(),
      // show Bloom counties by default
      // initialSearch: `counties:${jurisList}`,
      locations: locations,
    },
  }
}
