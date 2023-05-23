import React from "react"
import { Listing } from "@bloom-housing/backend-core/types"
import { ListingsMap } from "./ListingsMap"
import { ListingsList } from "./ListingsList"
import styles from "./ListingsCombined.module.scss"

type ListingsCombinedProps = {
  listings: Listing[]
  googleMapsApiKey: string
}

const ListingsCombined = (props: ListingsCombinedProps) => {
  return (
    <div className={styles["listings-combined"]}>
      <div className={styles["listings-map"]}>
        <ListingsMap listings={props.listings} googleMapsApiKey={props.googleMapsApiKey} />
      </div>
      <div className={styles["listings-list"]}>
        <ListingsList listings={props.listings}></ListingsList>
      </div>
    </div>
  )
}
export { ListingsCombined as default, ListingsCombined }
