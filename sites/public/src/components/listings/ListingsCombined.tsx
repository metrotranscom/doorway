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
    preventScrollOnSwipe: true,
  })

  return showListingsList ? (
    <div className={styles["listings-combined"]}>
      <div className={styles["listings-list-expanded"]}>
        <ListingsList
          listings={props.listings}
          currentPage={props.currentPage}
          lastPage={props.lastPage}
          onPageChange={props.onPageChange}
        ></ListingsList>
      </div>
    </div>
  ) : showListingsMap ? (
    <div className={styles["listings-combined"]}>
      <div className={styles["listings-map"]}>
        <ListingsMap listings={props.listings} googleMapsApiKey={props.googleMapsApiKey} />
      </div>
    </div>
  ) : (
    <div className={styles["listings-combined"]}>
      <ListingsMap listings={props.listings} googleMapsApiKey={props.googleMapsApiKey} />
      <div className={styles["listings-swipe-handler"]} {...swipeHandler}></div>
      <div className={styles["listings-list"]}>
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
export { ListingsCombined as default, ListingsCombined }
