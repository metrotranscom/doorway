import React, { useEffect, useState } from "react"
import { Listing } from "@bloom-housing/backend-core/types"
import { ListingsMap } from "./ListingsMap"
import { ListingsList } from "./ListingsList"
import styles from "./ListingsCombined.module.scss"

type ListingsCombinedProps = {
  listings: Listing[]
  googleMapsApiKey: string
  desktopMinWidth?: number
}

const ListingsCombined = (props: ListingsCombinedProps) => {
  const [isDesktop, setIsDesktop] = useState(true)

  const DESKTOP_MIN_WIDTH = props.desktopMinWidth || 767 // @screen md
  // Enables toggling off navbar links when entering mobile
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
  }, [DESKTOP_MIN_WIDTH])

  return isDesktop ? (
    <div className={styles["listings-combined"]}>
      <div className={styles["listings-map"]}>
        <ListingsMap listings={props.listings} googleMapsApiKey={props.googleMapsApiKey} />
      </div>
      <div className={styles["listings-list"]}>
        <ListingsList listings={props.listings}></ListingsList>
      </div>
    </div>
  ) : (
    <div className={styles["listings-combined__mobile"]}>
      <div className={styles["listings-map__mobile"]}>
        <ListingsMap listings={props.listings} googleMapsApiKey={props.googleMapsApiKey} />
      </div>
      <div className={styles["listings-list__mobile"]}>
        <ListingsList listings={props.listings}></ListingsList>
      </div>
    </div>
  )
}
export { ListingsCombined as default, ListingsCombined }
