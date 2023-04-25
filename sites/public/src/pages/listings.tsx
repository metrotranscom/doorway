import React, { useEffect, useContext } from "react"
import Head from "next/head"
import { PageHeader, t } from "@bloom-housing/ui-components"
import { ListingWithSourceMetadata } from "../../types/ListingWithSourceMetadata"
import { ListingList, pushGtmEvent, AuthContext } from "@bloom-housing/shared-helpers"
import { UserStatus } from "../lib/constants"
import Layout from "../layouts/application"
import { MetaTags } from "../components/shared/MetaTags"
import { ListingsMap } from "../components/listings/ListingsMap"
import { ListingsList } from "../components/listings/ListingsList"
import {
  fetchJurisdictionByName,
  fetchBloomJurisdictionsByName,
  fetchClosedListings,
  fetchOpenListings,
} from "../lib/hooks"

export interface ListingsProps {
  openListings: ListingWithSourceMetadata[]
  closedListings: ListingWithSourceMetadata[]
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
    <Layout>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <MetaTags title={t("nav.siteTitle")} image={metaImage} description={metaDescription} />
      <PageHeader title={t("pageTitle.rent")} />
      <div className="listings-combined">
        <ListingsMap listings={props.openListings}></ListingsMap>
        <ListingsList listings={props.openListings}></ListingsList>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() {
  // Hack alert: fetchOpenListings and fetchClosedListings call
  // fetchBloomJurisdictionsByName concurrently which causes a race condition
  // that calls the Jurisdictions API twice.
  //
  // Invoking fetchBloomJurisdictionsByName first avoids that situation by
  // making sure that the bloomJurisdictions instance variable is populated.
  // We may as well call fetchJurisdictionByName at the same time here for
  // performance reasons.
  await Promise.all([fetchJurisdictionByName(), fetchBloomJurisdictionsByName()])
  const openListings = fetchOpenListings()
  const closedListings = fetchClosedListings()

  return {
    props: { openListings: await openListings, closedListings: await closedListings },
  }
}
