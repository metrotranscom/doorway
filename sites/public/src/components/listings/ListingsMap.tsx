import React, { useEffect, useState } from "react"
import { useJsApiLoader } from "@react-google-maps/api"
import { APIProvider, Map } from "@vis.gl/react-google-maps"
import { getListingUrl, getListingCard } from "../../lib/helpers"
import styles from "./ListingsCombined.module.scss"
import { MapControl } from "../shared/MapControl"
import { t } from "@bloom-housing/ui-components"
import { Listing } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { ListingsMapMarkers } from "./ListingsMapMarkers"

type ListingsMapProps = {
  listings?: Listing[]
  googleMapsApiKey: string
  desktopMinWidth?: number
  isMapExpanded: boolean
  setShowListingsList?: React.Dispatch<React.SetStateAction<boolean>>
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

const ListingsMap = (props: ListingsMapProps) => {
  const markers: ListingsMapMarker[] = []

  const INITIAL_CAMERA = {
    center: { lat: 37.579795, lng: -122.374118 },
    zoom: 9,
  }

  const [infoWindowIndex, setInfoWindowIndex] = useState<number>(null)

  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(INITIAL_CAMERA.center)
  const [zoom, setZoom] = useState<number>(INITIAL_CAMERA.zoom)

  props.listings.forEach((listing: Listing, index) => {
    const lat = listing.listingsBuildingAddress.latitude
    const lng = listing.listingsBuildingAddress.longitude
    const uri = getListingUrl(listing)
    const infoWindowContent = getListingCard(listing, index)
    markers.push({ coordinate: { lat, lng }, uri, key: index, infoWindowContent })
  })

  const mapRef = React.useRef(null)
  return (
    <div className={styles["listings-map"]}>
      <a className={styles["listings-map-skip-link"]} href={`#listingsList`}>
        {t("t.skipMapOfListings")}
      </a>
      <MapControl zoom={zoom} setZoom={setZoom} />
      <APIProvider apiKey={props.googleMapsApiKey}>
        <Map
          mapId={"listings-map"}
          style={containerStyle}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          center={mapCenter}
          zoom={zoom}
          onCenterChanged={(map) => setMapCenter(map.detail.center)}
          onZoomChanged={(map) => setZoom(map.detail.zoom)}
        >
          <ListingsMapMarkers
            mapMarkers={markers}
            setMapCenter={setMapCenter}
            setZoom={setZoom}
            infoWindowIndex={infoWindowIndex}
            setInfoWindowIndex={setInfoWindowIndex}
          />
        </Map>
      </APIProvider>
    </div>
  )
}

export { ListingsMap as default, ListingsMap }
