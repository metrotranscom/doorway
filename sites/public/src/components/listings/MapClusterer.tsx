import React, { useCallback, useEffect, useMemo, useState } from "react"
import { InfoWindow, useMap } from "@vis.gl/react-google-maps"
import { MarkerClusterer } from "@googlemaps/markerclusterer"
import { ListingsMapMarker } from "./ListingsMap"
import { MapMarker } from "./MapMarker"
import styles from "./ListingsCombined.module.scss"

export type ListingsMapMarkersProps = {
  mapMarkers: ListingsMapMarker[]
  setMapCenter: React.Dispatch<React.SetStateAction<google.maps.LatLngLiteral>>
  setZoom: React.Dispatch<React.SetStateAction<number>>
  infoWindowIndex: number
  setInfoWindowIndex: React.Dispatch<React.SetStateAction<number>>
}

export const MapClusterer = ({
  mapMarkers,
  setMapCenter,
  setZoom,
  infoWindowIndex,
  setInfoWindowIndex,
}: ListingsMapMarkersProps) => {
  const [markers, setMarkers] = useState<{
    [key: string]: google.maps.marker.AdvancedMarkerElement
  }>({})

  const map = useMap()
  const clusterer: MarkerClusterer = useMemo(() => {
    if (!map) return null

    return new MarkerClusterer({
      map,
      renderer: {
        render: ({ count, position }) => {
          const clusterMarker = document.createElement("div")
          clusterMarker.className = styles["cluster-icon"]
          clusterMarker.textContent = count.toString()

          return new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            content: clusterMarker,
            title: `${count} listings in this cluster`,
          })
        },
      },
    })
  }, [map])

  useEffect(() => {
    if (!clusterer) return

    clusterer.clearMarkers()
    clusterer.addMarkers(Object.values(markers))

    const bounds = new window.google.maps.LatLngBounds()

    if (!map) return
    mapMarkers.map((marker) => {
      bounds.extend({
        lat: marker.coordinate.lat,
        lng: marker.coordinate.lng,
      })
    })
    map.fitBounds(bounds, 150)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterer, markers])

  const setMarkerRef = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement | null, key: number) => {
      setMarkers((markers) => {
        if ((marker && markers[key]) || (!marker && !markers[key])) return markers

        if (marker) {
          return { ...markers, [key]: marker }
        } else {
          const { [key]: _, ...newMarkers } = markers

          return newMarkers
        }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const handleMarkerClick = useCallback((marker: ListingsMapMarker) => {
    setInfoWindowIndex(marker.key)
    setMapCenter(marker.coordinate)
    setZoom(15)
    setInfoWindowIndex(marker.key)
  }, [])

  return (
    <>
      {mapMarkers?.map((marker) => (
        <MapMarker
          key={marker.key}
          marker={marker}
          onClick={handleMarkerClick}
          setMarkerRef={setMarkerRef}
        />
      ))}

      {infoWindowIndex !== null && (
        <InfoWindow
          anchor={markers[infoWindowIndex]}
          onCloseClick={() => setInfoWindowIndex(null)}
          className={"info-window"}
          minWidth={250}
          maxWidth={500}
        >
          {mapMarkers[infoWindowIndex].infoWindowContent}
        </InfoWindow>
      )}
    </>
  )
}
