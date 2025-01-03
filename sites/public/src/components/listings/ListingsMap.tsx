import React, { useState } from "react"
import { APIProvider, Map } from "@vis.gl/react-google-maps"
import { useJsApiLoader } from "@react-google-maps/api"
import { Heading } from "@bloom-housing/ui-seeds"
import { t } from "@bloom-housing/ui-components"
import { ListingMapMarker } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { MapControl } from "../shared/MapControl"
import { MapClusterer } from "./MapClusterer"
import styles from "./ListingsCombined.module.scss"
import { ListingSearchParams } from "../../lib/listings/search"

const defaultCenter = {
  lat: 37.579795,
  lng: -122.374118,
}
const defaultZoom = 9

type ListingsMapProps = {
  listings?: ListingMapMarker[] | null
  googleMapsApiKey: string
  googleMapsMapId: string
  desktopMinWidth?: number
  isMapExpanded: boolean
  setVisibleMarkers: React.Dispatch<React.SetStateAction<MapMarkerData[]>>
  visibleMarkers: MapMarkerData[]
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  searchFilter: ListingSearchParams
  isFirstBoundsLoad: boolean
  setIsFirstBoundsLoad: React.Dispatch<React.SetStateAction<boolean>>
  isDesktop: boolean
}

export type MapMarkerData = {
  id: string
  key: number
  coordinate: google.maps.LatLngLiteral
}

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  position: "relative",
  display: "block",
}

const getMarkers = (listings: ListingMapMarker[]) => {
  const markers: MapMarkerData[] | null = []
  if (!listings) return null
  listings?.forEach((listing: ListingMapMarker, index) => {
    markers.push({
      coordinate: {
        lat: listing.lat,
        lng: listing.lng,
      },
      id: listing.id,
      key: index,
    })
  })
  return markers
}

const ListingsMap = (props: ListingsMapProps) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: props.googleMapsApiKey,
  })

  const [infoWindowIndex, setInfoWindowIndex] = useState<number>(null)

  const markers: MapMarkerData[] | null = getMarkers(props.listings)

  if (!isLoaded) return <></>

  return (
    <div id={"listings-map"} className={styles["listings-map"]}>
      <a className={styles["listings-map-skip-link"]} href={`#listingsList`}>
        {t("t.skipMapOfListings")}
      </a>
      <Heading className={"sr-only"} priority={2}>
        {t("t.listingsMap")}
      </Heading>
      <APIProvider apiKey={props.googleMapsApiKey}>
        <Map
          mapId={props.googleMapsMapId}
          style={containerStyle}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          defaultZoom={defaultZoom}
          defaultCenter={defaultCenter}
          clickableIcons={false}
        >
          <MapControl />
          <MapClusterer
            mapMarkers={markers}
            infoWindowIndex={infoWindowIndex}
            setInfoWindowIndex={setInfoWindowIndex}
            setVisibleMarkers={props.setVisibleMarkers}
            visibleMarkers={props.visibleMarkers}
            setIsLoading={props.setIsLoading}
            searchFilter={props.searchFilter}
            isFirstBoundsLoad={props.isFirstBoundsLoad}
            setIsFirstBoundsLoad={props.setIsFirstBoundsLoad}
            isDesktop={props.isDesktop}
          />
        </Map>
      </APIProvider>
    </div>
  )
}

export { ListingsMap as default, ListingsMap }
