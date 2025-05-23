import React from "react"
import { useMap } from "@vis.gl/react-google-maps"
import { ListingMapMarker } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { Button } from "@bloom-housing/ui-seeds"
import { t } from "@bloom-housing/ui-components"
import { fitBounds } from "../listings/MapClusterer"
import styles from "./MapRecenter.module.scss"

type MapRecenterProps = {
  visibleMapMarkers: number
  mapMarkers: ListingMapMarker[] | null
  isLoading: boolean
}

const MapRecenter = (props: MapRecenterProps) => {
  const map = useMap()

  if (
    !map ||
    props.visibleMapMarkers === undefined ||
    props.visibleMapMarkers === props.mapMarkers.length ||
    props.isLoading
  )
    return null

  return (
    <div className={styles["map-recenter"]}>
      <Button
        onClick={() => {
          fitBounds(
            map,
            props.mapMarkers.map((marker, index) => {
              return {
                id: marker.id,
                key: index,
                coordinate: { lat: marker.lat, lng: marker.lng },
              }
            }),
            true
          )
        }}
        size={"sm"}
        variant={"primary-outlined"}
        id={"map-recenter-button"}
      >
        {t("t.recenterMap")}
      </Button>
    </div>
  )
}

export { MapRecenter as default, MapRecenter }
