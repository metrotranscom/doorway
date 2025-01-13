import * as React from "react"
import { useMap } from "@vis.gl/react-google-maps"
import { Listing, ListingMapMarker } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { Heading, Button } from "@bloom-housing/ui-seeds"
import { ZeroListingsItem } from "@bloom-housing/doorway-ui-components"
import { LoadingOverlay, t, InfoCard, LinkButton } from "@bloom-housing/ui-components"
import { getBoundsZoomLevel, getListings } from "../../lib/helpers"
import { Pagination } from "./Pagination"
import styles from "./ListingsCombined.module.scss"

type ListingsListProps = {
  listings: Listing[]
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
  loading: boolean
  mapMarkers: ListingMapMarker[] | null
}

const ListingsList = (props: ListingsListProps) => {
  const map = useMap()

  if (!map) return null

  const listingsDiv = (
    <div id="listingsList">
      <Heading className={"sr-only"} priority={2}>
        {t("t.listingsList")}
      </Heading>
      {props.listings.length > 0 || props.loading ? (
        <div className={styles["listings-list-container"]}>{getListings(props.listings)}</div>
      ) : (
        <ZeroListingsItem title={t("t.noMatchingListings")} description={t("t.tryRemovingFilters")}>
          {props.mapMarkers.length > 0 && (
            <Button
              onClick={() => {
                const bounds = new window.google.maps.LatLngBounds()

                if (!map) return
                props.mapMarkers?.map((marker) => {
                  bounds.extend({
                    lat: marker.lat,
                    lng: marker.lng,
                  })
                })
                map.fitBounds(bounds, document.getElementById("listings-map").clientWidth * 0.05)
                if (props.mapMarkers.length === 1) {
                  const zoomLevel = getBoundsZoomLevel(bounds)
                  map.setZoom(zoomLevel - 7)
                }
              }}
            >
              Zoom out to more listings
            </Button>
          )}
        </ZeroListingsItem>
      )}
    </div>
  )

  const infoCards = (
    <div className={styles["info-cards-container"]}>
      {process.env.notificationsSignUpUrl && (
        <InfoCard
          title={t("t.signUpForAlerts")}
          subtitle={t("t.subscribeToListingAlerts")}
          className="is-normal-primary-lighter"
        >
          <LinkButton
            href={process.env.notificationsSignUpUrl}
            newTab={true}
            className="is-primary"
          >
            {t("t.signUp")}
          </LinkButton>
        </InfoCard>
      )}
      <InfoCard
        title={t("t.needHelp")}
        subtitle={t("t.emergencyShelter")}
        className="is-normal-secondary-lighter"
      >
        <LinkButton href="/help/housing-help" className="is-secondary">
          {t("t.helpCenter")}
        </LinkButton>
      </InfoCard>
      <InfoCard
        title={t("t.housingInSanFrancisco")}
        subtitle={t("t.seeSanFranciscoListings")}
        className="is-normal-secondary-lighter"
      >
        <LinkButton href="https://housing.sfgov.org/" newTab={true} className="is-secondary">
          {t("t.seeListings")}
        </LinkButton>
      </InfoCard>
    </div>
  )

  const pagination =
    props.lastPage !== 0 ? (
      <Pagination
        currentPage={props.currentPage}
        lastPage={props.lastPage}
        onPageChange={props.onPageChange}
      />
    ) : (
      <></>
    )
  return (
    <section className={styles["listings-list-wrapper"]} aria-label="Listings list">
      <LoadingOverlay isLoading={props.loading}>{listingsDiv}</LoadingOverlay>
      {pagination}
      {infoCards}
    </section>
  )
}
export { ListingsList as default, ListingsList }
