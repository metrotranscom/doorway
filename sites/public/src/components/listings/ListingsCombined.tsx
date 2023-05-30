import React, { useEffect, useState } from "react"
import { Listing } from "@bloom-housing/backend-core/types"
import { ListingsMap } from "./ListingsMap"
import { ListingsList } from "./ListingsList"
import { useSwipeable } from "react-swipeable"
import styles from "./ListingsCombined.module.scss"

type ListingsCombinedProps = {
  listings: Listing[]
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
  googleMapsApiKey: string
}

const ListingsCombined = (props: ListingsCombinedProps) => {
  const [showListingsList, setShowListingsList] = useState(false)
  const [showListingsMap, setShowListingsMap] = useState(false)

  const swipeHandler = useSwipeable({
    onSwipedUp: () => {
      setShowListingsList(true)
      setShowListingsMap(false)
    },
    onSwipedDown: () => {
      setShowListingsList(false)
      setShowListingsMap(true)
    },
  })

  const swipeUpHandler = useSwipeable({
    onSwipedUp: () => {
      setShowListingsList(false)
      setShowListingsMap(false)
    },
  })

  const swipeDownHandler = useSwipeable({
    onSwipedDown: () => {
      setShowListingsList(false)
      setShowListingsMap(false)
    },
  })

  const getListingsList = () => {
    return (
      <div className={styles["listings-combined"]}>
        <ListingsMap listings={props.listings} googleMapsApiKey={props.googleMapsApiKey} />
        <div className={styles["swipe-area"]} {...swipeDownHandler}>
          <div className={styles["swipe-area-line"]}></div>
        </div>
        <div className={styles["listings-list-expanded"]}>
          <ListingsList
            listings={props.listings}
            currentPage={props.currentPage}
            lastPage={props.lastPage}
            onPageChange={props.onPageChange}
          ></ListingsList>
        </div>
      </div>
    )
  }

  const getListingsMap = () => {
    return (
      <div className={styles["listings-combined"]}>
        <div className={styles["listings-map-expanded"]}>
          <ListingsMap listings={props.listings} googleMapsApiKey={props.googleMapsApiKey} />
        </div>
        <div className={styles["swipe-area-bottom"]} {...swipeUpHandler}>
          <div className={styles["swipe-area-line"]}></div>
        </div>
      </div>
    )
  }

  const getListingsCombined = () => {
    return (
      <div className={styles["listings-combined"]}>
        <ListingsMap listings={props.listings} googleMapsApiKey={props.googleMapsApiKey} />
        <div className={styles["listings-outer-container"]}>
          <div className={styles["swipe-area"]} {...swipeHandler}>
            <div className={styles["swipe-area-line"]}></div>
          </div>
          <div className={styles["listings-list"]}>
            <ListingsList
              listings={props.listings}
              currentPage={props.currentPage}
              lastPage={props.lastPage}
              onPageChange={props.onPageChange}
            ></ListingsList>
          </div>
        </div>
      </div>
    )
  }

  return showListingsList
    ? getListingsList()
    : showListingsMap
    ? getListingsMap()
    : getListingsCombined()
}
export { ListingsCombined as default, ListingsCombined }
