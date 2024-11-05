import React, { useState } from "react"
import { APIProvider, Map, MapCameraChangedEvent } from "@vis.gl/react-google-maps"
import { useJsApiLoader } from "@react-google-maps/api"
import { t } from "@bloom-housing/ui-components"
import { Listing } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { getListingUrl, getListingCard } from "../../lib/helpers"
import { MapControl } from "../shared/MapControl"
import { MapClusterer } from "./MapClusterer"
import styles from "./ListingsCombined.module.scss"

type ListingsMapProps = {
  listings?: Listing[]
  googleMapsApiKey: string
  desktopMinWidth?: number
  isMapExpanded: boolean
}

export type ListingsMapMarker = {
  uri: string
  key: number
  infoWindowContent: React.JSX.Element
  coordinate: google.maps.LatLngLiteral
}

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  position: "relative",
  display: "block",
}

const getMarkers = (listings: Listing[]) => {
  const markers: ListingsMapMarker[] = []
  listings.forEach((listing: Listing, index) => {
    markers.push({
      coordinate: {
        lat: listing.listingsBuildingAddress.latitude,
        lng: listing.listingsBuildingAddress.longitude,
      },
      uri: getListingUrl(listing),
      key: index,
      infoWindowContent: getListingCard(listing, index),
    })
  })
  return markers
}

const ListingsMap = (props: ListingsMapProps) => {
  const defaultCenter = {
    lat: 37.579795,
    lng: -122.374118,
  }
  const defaultZoom = 9

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: props.googleMapsApiKey,
  })

  const [infoWindowIndex, setInfoWindowIndex] = useState<number>(null)

  const markers: ListingsMapMarker[] = getMarkers(props.listings)

  if (!isLoaded) return <></>

  return (
    <div id={"listings-map"} className={styles["listings-map"]}>
      <a className={styles["listings-map-skip-link"]} href={`#listingsList`}>
        {t("t.skipMapOfListings")}
      </a>
      <APIProvider apiKey={props.googleMapsApiKey}>
        <Map
          mapId={"listings-map"}
          style={containerStyle}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          defaultZoom={defaultZoom}
          defaultCenter={defaultCenter}
        >
          <MapControl />
          <MapClusterer
            mapMarkers={markers}
            infoWindowIndex={infoWindowIndex}
            setInfoWindowIndex={setInfoWindowIndex}
          />
        </Map>
      </APIProvider>
    </div>
  )
}

export { ListingsMap as default, ListingsMap }
