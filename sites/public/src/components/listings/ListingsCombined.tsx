import React from "react"
import { Listing, ListingMapMarker } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import CustomSiteFooter from "../shared/CustomSiteFooter"
import { ListingsMap, MapMarkerData } from "./ListingsMap"
import { ListingsList } from "./ListingsList"
import styles from "./ListingsCombined.module.scss"
import { ListingsSearchMetadata } from "./search/ListingsSearchMetadata"
import { ListingSearchParams } from "../../lib/listings/search"

type ListingsCombinedProps = {
  markers: ListingMapMarker[] | null
  onPageChange: (page: number) => void
  googleMapsApiKey: string
  googleMapsMapId: string
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  filterCount: number
  searchResults: {
    listings: Listing[]
    currentPage: number
    lastPage: number
    totalItems: number
  }
  listView: boolean
  setListView: React.Dispatch<React.SetStateAction<boolean>>
  setVisibleMarkers: React.Dispatch<React.SetStateAction<MapMarkerData[]>>
  visibleMarkers: MapMarkerData[]
  isDesktop: boolean
  loading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  searchFilter: ListingSearchParams
}

const ListingsCombined = (props: ListingsCombinedProps) => {
  const getListingsList = () => {
    return (
      <div className={styles["listings-combined"]}>
        <ListingsSearchMetadata
          loading={props.loading}
          setModalOpen={props.setModalOpen}
          filterCount={props.filterCount}
          searchResults={props.searchResults}
          setListView={props.setListView}
          listView={props.listView}
        />
        <div
          className={`${styles["listings-map-list-container"]} ${styles["listings-map-list-container-list-only"]}`}
        >
          <div id="listings-list-expanded" className={styles["listings-list-expanded"]}>
            <ListingsList
              listings={props.searchResults.listings}
              currentPage={props.searchResults.currentPage}
              lastPage={props.searchResults.lastPage}
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
      <div className={styles["listings-combined"]}>
        <ListingsSearchMetadata
          loading={props.loading}
          setModalOpen={props.setModalOpen}
          filterCount={props.filterCount}
          searchResults={props.searchResults}
          setListView={props.setListView}
          listView={props.listView}
        />
        <div className={styles["listings-map-expanded"]}>
          <ListingsMap
            listings={props.markers}
            googleMapsApiKey={props.googleMapsApiKey}
            googleMapsMapId={props.googleMapsMapId}
            isMapExpanded={true}
            setVisibleMarkers={props.setVisibleMarkers}
            visibleMarkers={props.visibleMarkers}
            setIsLoading={props.setIsLoading}
            searchFilter={props.searchFilter}
          />
        </div>
      </div>
    )
  }

  const getListingsCombined = () => {
    return (
      <div className={styles["listings-combined"]}>
        <ListingsSearchMetadata
          loading={props.loading}
          setModalOpen={props.setModalOpen}
          filterCount={props.filterCount}
          searchResults={props.searchResults}
          setListView={props.setListView}
          listView={props.listView}
        />
        <div className={styles["listings-map-list-container"]}>
          <div className={styles["listings-map"]}>
            <ListingsMap
              listings={props.markers}
              googleMapsApiKey={props.googleMapsApiKey}
              googleMapsMapId={props.googleMapsMapId}
              isMapExpanded={false}
              setVisibleMarkers={props.setVisibleMarkers}
              visibleMarkers={props.visibleMarkers}
              setIsLoading={props.setIsLoading}
              searchFilter={props.searchFilter}
            />
          </div>
          <div id="listings-outer-container" className={styles["listings-outer-container"]}>
            <div id="listings-list" className={styles["listings-list"]}>
              <ListingsList
                listings={props.searchResults.listings}
                currentPage={props.searchResults.currentPage}
                lastPage={props.searchResults.lastPage}
                loading={props.loading}
                onPageChange={props.onPageChange}
              />
              <CustomSiteFooter />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const hideFooter = () => {
    const footer = Array.from(
      document.getElementsByClassName("site-footer") as HTMLCollectionOf<HTMLElement>
    )[0]
    if (footer !== undefined && footer.style.display !== "none") {
      footer.style.display = "none"
    }
  }
  const showFooter = () => {
    const footer = Array.from(
      document.getElementsByClassName("site-footer") as HTMLCollectionOf<HTMLElement>
    )[0]
    if (footer !== undefined && footer.style.display == "none") {
      footer.style.display = "flex"
    }
  }

  let div: JSX.Element

  if (!props.isDesktop && props.listView) {
    div = getListingsList()
    showFooter()
  } else if (!props.isDesktop && !props.listView) {
    div = getListingsMap()
    hideFooter()
  } else if (props.isDesktop) {
    div = getListingsCombined()
    showFooter()
  }

  return div
}

export { ListingsCombined as default, ListingsCombined }
