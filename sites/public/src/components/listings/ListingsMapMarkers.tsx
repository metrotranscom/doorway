import React, { useCallback, useEffect, useMemo, useState } from "react"
import { InfoWindow, useMap } from "@vis.gl/react-google-maps"
import { type Marker, MarkerClusterer } from "@googlemaps/markerclusterer"
import { ListingsMapMarker } from "./ListingsMap"
import { MapMarker } from "./ListingsMapMarker"
import styles from "./ListingsCombined.module.scss"

export type ListingsMapMarkersProps = {
  mapMarkers: ListingsMapMarker[]
  setMapCenter: React.Dispatch<React.SetStateAction<google.maps.LatLngLiteral>>
  setZoom: React.Dispatch<React.SetStateAction<number>>
  infoWindowIndex: number
  setInfoWindowIndex: React.Dispatch<React.SetStateAction<number>>
}

export const ListingsMapMarkers = ({
  mapMarkers,
  setMapCenter,
  setZoom,
  infoWindowIndex,
  setInfoWindowIndex,
}: ListingsMapMarkersProps) => {
  const [markers, setMarkers] = useState<{ [key: string]: Marker }>({})

  const map = useMap()
  const clusterer: MarkerClusterer = useMemo(() => {
    if (!map) return null

    return new MarkerClusterer({
      map,
      renderer: {
        render: ({ count, position }) => {
          const svg = window.btoa(`
      <svg fill="#0077da" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <circle cx="120" cy="120" opacity="1" r="70" />    
      </svg>`)
          return new google.maps.Marker({
            position,
            icon: {
              url: `data:image/svg+xml;base64,${svg}`,
              scaledSize: new google.maps.Size(60, 60),
            },
            label: {
              text: count.toString(),
              color: "rgba(255,255,255,1)",
              fontSize: "14px",
              fontWeight: "600",
            },
            // adjust zIndex to be above other markers
            zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
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
  }, [clusterer, markers])

  const setMarkerRef = useCallback((marker: Marker | null, key: number) => {
    setMarkers((markers) => {
      if ((marker && markers[key]) || (!marker && !markers[key])) return markers

      if (marker) {
        return { ...markers, [key]: marker }
      } else {
        const { [key]: _, ...newMarkers } = markers

        return newMarkers
      }
    })
  }, [])

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
