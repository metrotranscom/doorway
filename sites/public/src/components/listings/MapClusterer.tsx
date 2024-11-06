import React, { useCallback, useEffect, useMemo, useState } from "react"
import { InfoWindow, useMap } from "@vis.gl/react-google-maps"
import { MarkerClusterer } from "@googlemaps/markerclusterer"
import { ListingsMapMarker } from "./ListingsMap"
import { MapMarker } from "./MapMarker"
import styles from "./ListingsCombined.module.scss"

export type ListingsMapMarkersProps = {
  mapMarkers: ListingsMapMarker[]
  infoWindowIndex: number
  setInfoWindowIndex: React.Dispatch<React.SetStateAction<number>>
}

const getBoundsZoomLevel = (bounds: google.maps.LatLngBounds) => {
  const mapElement = document.getElementById("listings-map")
  const WORLD_DIM = { height: 256, width: 256 }
  const ZOOM_MAX = 21

  function latRad(lat) {
    const sin = Math.sin((lat * Math.PI) / 180)
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2
  }

  function zoom(mapPx, worldPx, fraction) {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2)
  }

  const ne = bounds.getNorthEast()
  const sw = bounds.getSouthWest()

  const latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI

  const lngDiff = ne.lng() - sw.lng()
  const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360

  const latZoom = zoom(mapElement.clientHeight, WORLD_DIM.height, latFraction)
  const lngZoom = zoom(mapElement.clientWidth, WORLD_DIM.width, lngFraction)

  return Math.min(latZoom, lngZoom, ZOOM_MAX)
}

const animateMapZoomTo = (
  map: google.maps.Map,
  targetZoom: number,
  panTo?: google.maps.LatLngLiteral
) => {
  const currentZoom = map.getZoom()
  if (currentZoom >= targetZoom) return
  if (currentZoom !== targetZoom) {
    google.maps.event.addListenerOnce(map, "zoom_changed", () => {
      animateMapZoomTo(map, targetZoom)
    })
    if (panTo) map.setCenter(panTo)
    setTimeout(function () {
      map.setZoom(currentZoom + 1)
    }, 80)
  }
}

export const MapClusterer = ({
  mapMarkers,
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
      onClusterClick: (_, cluster, map) => {
        const zoomLevel = getBoundsZoomLevel(cluster.bounds)
        animateMapZoomTo(map, zoomLevel - 1)
        map.panTo(cluster.bounds.getCenter())
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
    map.fitBounds(bounds, document.getElementById("listings-map").clientWidth * 0.1)
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
    animateMapZoomTo(map, 14)
    const divHeightOfTheMap = document.getElementById("listings-map").clientHeight
    const offSetFromBottom = 10
    map.panTo(marker.coordinate)
    google.maps.event.addListenerOnce(map, "tilesloaded", function () {
      map.panBy(0, -(divHeightOfTheMap / 2 - offSetFromBottom))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          disableAutoPan={true}
        >
          {mapMarkers[infoWindowIndex].infoWindowContent}
        </InfoWindow>
      )}
    </>
  )
}
