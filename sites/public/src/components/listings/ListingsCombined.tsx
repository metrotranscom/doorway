import React, { useState, useEffect } from "react"
import { Listing } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import CustomSiteFooter from "../shared/CustomSiteFooter"
import { ListingsMap } from "./ListingsMap"
import { ListingsList } from "./ListingsList"
import styles from "./ListingsCombined.module.scss"
import { ListingsSearchMetadata } from "./search/ListingsSearchMetadata"

type ListingsCombinedProps = {
  listings: Listing[]
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
  googleMapsApiKey: string
  googleMapsMapId: string
  loading: boolean
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  filterCount: number
  searchResults: {
    listings: Listing[]
    currentPage: number
    lastPage: number
    totalItems: number
    loading: boolean
  }
  listView: boolean
  setListView: React.Dispatch<React.SetStateAction<boolean>>
}

const ListingsCombined = (props: ListingsCombinedProps) => {
  const [isDesktop, setIsDesktop] = useState(true)

  const DESKTOP_MIN_WIDTH = 767 // @screen md
  useEffect(() => {
    if (window.innerWidth > DESKTOP_MIN_WIDTH) {
      setIsDesktop(true)
    } else {
      setIsDesktop(false)
    }

    const updateMedia = () => {
      if (window.innerWidth > DESKTOP_MIN_WIDTH) {
        setIsDesktop(true)
      } else {
        setIsDesktop(false)
      }
    }
    window.addEventListener("resize", updateMedia)
    return () => window.removeEventListener("resize", updateMedia)
  }, [])

  const getListingsList = () => {
    return (
      <div className={styles["listings-combined"]}>
        <ListingsSearchMetadata
          loading={props.searchResults.loading}
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
      <div className={styles["listings-combined"]}>
        <ListingsSearchMetadata
          loading={props.searchResults.loading}
          setModalOpen={props.setModalOpen}
          filterCount={props.filterCount}
          searchResults={props.searchResults}
          setListView={props.setListView}
          listView={props.listView}
        />
        <div className={styles["listings-map-expanded"]}>
          <ListingsMap
            listings={props.listings}
            googleMapsApiKey={props.googleMapsApiKey}
            googleMapsMapId={props.googleMapsMapId}
            isMapExpanded={true}
          />
        </div>
      </div>
    )
  }

  const getListingsCombined = () => {
    return (
      <div className={styles["listings-combined"]}>
        <ListingsSearchMetadata
          loading={props.searchResults.loading}
          setModalOpen={props.setModalOpen}
          filterCount={props.filterCount}
          searchResults={props.searchResults}
          setListView={props.setListView}
          listView={props.listView}
        />
        <div className={styles["listings-map-list-container"]}>
          <div className={styles["listings-map"]}>
            <ListingsMap
              listings={props.listings}
              googleMapsApiKey={props.googleMapsApiKey}
              googleMapsMapId={props.googleMapsMapId}
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

  if (!isDesktop && props.listView) {
    div = getListingsList()
    showFooter()
  } else if (!isDesktop && !props.listView) {
    div = getListingsMap()
    hideFooter()
  } else if (isDesktop) {
    div = getListingsCombined()
    showFooter()
  }

  return div
}

export { ListingsCombined as default, ListingsCombined }
