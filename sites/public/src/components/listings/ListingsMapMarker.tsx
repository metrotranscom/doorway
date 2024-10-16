import React, { useCallback } from "react"
import type { Marker } from "@googlemaps/markerclusterer"
import { AdvancedMarker } from "@vis.gl/react-google-maps"
import { ListingsMapMarker } from "./ListingsMap"
import styles from "./ListingsMapMarker.module.scss"

export type MapMarkerProp = {
  marker: ListingsMapMarker
  onClick: (marker: ListingsMapMarker) => void
  setMarkerRef: (marker: Marker | null, key: number) => void
}

/**
 * Wrapper Component for an AdvancedMarker for a single tree.
 */
export const MapMarker = (props: MapMarkerProp) => {
  const { marker, onClick, setMarkerRef } = props

  const handleClick = useCallback(() => onClick(marker), [onClick, marker])
  const ref = useCallback(
    (markerElement: google.maps.marker.AdvancedMarkerView) =>
      setMarkerRef(markerElement, marker.key),
    [setMarkerRef, marker.key]
  )

  return (
    <AdvancedMarker position={marker.coordinate} onClick={handleClick} ref={ref}>
      <span className={styles["marker-clustering-tree"]}>
        <img src="/images/map-pin.svg" />
      </span>
    </AdvancedMarker>
  )
}
