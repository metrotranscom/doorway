import React, { useCallback } from "react"
import { AdvancedMarker } from "@vis.gl/react-google-maps"
import { ListingsMapMarker } from "./ListingsMap"
import styles from "./ListingsCombined.module.scss"

export type MapMarkerProp = {
  marker: ListingsMapMarker
  onClick: (marker: ListingsMapMarker) => void
  setMarkerRef: (marker: google.maps.marker.AdvancedMarkerElement | null, key: number) => void
}

export const MapMarker = (props: MapMarkerProp) => {
  const { marker, onClick, setMarkerRef } = props

  const handleClick = useCallback(() => onClick(marker), [onClick, marker])
  const ref = useCallback(
    (markerElement: google.maps.marker.AdvancedMarkerElement) =>
      setMarkerRef(markerElement, marker.key),
    [setMarkerRef, marker.key]
  )

  return (
    <AdvancedMarker position={marker.coordinate} onClick={handleClick} ref={ref}>
      <span>
        <img src="/images/map-pin.svg" alt={"Listing pin"} />
      </span>
    </AdvancedMarker>
  )
}
