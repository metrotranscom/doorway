import React from "react"
import { Listing } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { ListingsMap } from "./ListingsMapDeprecated"
import { ListingsList } from "./ListingsList"
import CustomSiteFooter from "../shared/CustomSiteFooter"
import styles from "./ListingsCombined.module.scss"

type ListingsCombinedProps = {
  listings: Listing[]
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
  googleMapsApiKey: string
  loading: boolean
  listView: boolean
  setListView: React.Dispatch<React.SetStateAction<boolean>>
  isDesktop: boolean
}

const ListingsCombined = (props: ListingsCombinedProps) => {
  const getListingsList = () => {
    return (
      <div className={`${styles["listings-combined"]} flex-row`}>
        <div className={styles["listings-map"]}>
          <ListingsMap
            listings={props.listings}
            googleMapsApiKey={props.googleMapsApiKey}
            isMapExpanded={false}
          />
        </div>
        <div
          className={`${styles["listings-map-list-container"]} ${styles["listings-map-list-container-list-only"]}`}
        >
          <div id="listings-list-expanded" className={styles["listings-list-expanded"]}>
            <ListingsList
              listings={props.listings}
              currentPage={props.currentPage}
              lastPage={props.lastPage}
              onPageChange={props.onPageChange}
              loading={props.loading}
            />
          </div>
          <div>
            <CustomSiteFooter />
          </div>
        </div>
      </div>
    )
  }

  const getListingsMap = () => {
    return (
      <div className={`${styles["listings-combined"]} flex-row`}>
        <div className={styles["listings-map-expanded"]}>
          <ListingsMap
            listings={props.listings}
            googleMapsApiKey={props.googleMapsApiKey}
            isMapExpanded={true}
          />
        </div>
      </div>
    )
  }

  const getListingsCombined = () => {
    return (
      <div className={`${styles["listings-combined"]} flex-row`}>
        <div className={styles["listings-map"]}>
          <ListingsMap
            listings={props.listings}
            googleMapsApiKey={props.googleMapsApiKey}
            isMapExpanded={false}
          />
        </div>
        <div id="listings-outer-container" className={styles["listings-outer-container"]}>
          <div id="listings-list" className={styles["listings-list"]}>
            <ListingsList
              listings={props.listings}
              currentPage={props.currentPage}
              lastPage={props.lastPage}
              loading={props.loading}
              onPageChange={props.onPageChange}
            />
            <CustomSiteFooter />
          </div>
        </div>
      </div>
    )
  }

  let div: JSX.Element

  if (!props.isDesktop && props.listView) {
    div = getListingsList()
  } else if (!props.isDesktop && !props.listView) {
    div = getListingsMap()
  } else if (props.isDesktop) {
    div = getListingsCombined()
  }

  return div
}

export { ListingsCombined as default, ListingsCombined }
