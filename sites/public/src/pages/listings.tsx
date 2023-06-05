import React, { useEffect, useContext } from "react"
import Head from "next/head"
import { t } from "@bloom-housing/ui-components"
import { Listing } from "@bloom-housing/backend-core/types"
import { ListingList, pushGtmEvent, AuthContext } from "@bloom-housing/shared-helpers"
import { UserStatus } from "../lib/constants"
import LayoutWithoutFooter from "../layouts/LayoutWithoutFooter"
import { MetaTags } from "../components/shared/MetaTags"
import { ListingsCombined } from "../components/listings/ListingsCombined"
import { runtimeConfig } from "../lib/runtime-config"
import { ListingService } from "../lib/listings/listing-service"

export interface ListingsProps {
  openListings: Listing[]
  googleMapsApiKey: string
}

export default function ListingsPage(props: ListingsProps) {
  const { profile } = useContext(AuthContext)
  const pageTitle = `${t("pageTitle.rent")} - ${t("nav.siteTitle")}`
  const metaDescription = t("pageDescription.welcome", { regionName: t("region.name") })
  const metaImage = "" // TODO: replace with hero image

  useEffect(() => {
    pushGtmEvent<ListingList>({
      event: "pageView",
      pageTitle: "Rent Affordable Housing - Housing Portal",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
      numberOfListings: props.openListings.length,
      listingIds: props.openListings.map((listing) => listing.id),
    })
  }, [profile, props.openListings])
  return (
    <LayoutWithoutFooter>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <MetaTags title={t("nav.siteTitle")} image={metaImage} description={metaDescription} />
      <ListingsCombined
        listings={props.openListings}
        googleMapsApiKey={props.googleMapsApiKey}
        currentPage={1}
        lastPage={1}
        onPageChange={(page: number) => {
          console.log(page)
        }}
      />
    </LayoutWithoutFooter>
  )
}

export async function getServerSideProps() {
  const listingService = new ListingService(runtimeConfig.getListingServiceUrl())

  return {
    props: {
      openListings: await listingService.fetchOpenListings(),
      googleMapsApiKey: runtimeConfig.getGoogleMapsApiKey(),
    },
  }
}
