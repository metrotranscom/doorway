import React, { useCallback, useEffect, useMemo, useState, useContext } from "react"
import { InfoWindow, useMap } from "@vis.gl/react-google-maps"
import { MarkerClusterer } from "@googlemaps/markerclusterer"
import { AuthContext } from "@bloom-housing/shared-helpers"
import { MapMarkerData } from "./ListingsMap"
import { MapMarker } from "./MapMarker"
import styles from "./ListingsCombined.module.scss"
import { ListingViews } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { getListingCard } from "../../lib/helpers"

export type ListingsMapMarkersProps = {
  mapMarkers: MapMarkerData[] | null
  infoWindowIndex: number
  setInfoWindowIndex: React.Dispatch<React.SetStateAction<number>>
  visibleMarkers: MapMarkerData[]
  setVisibleMarkers: React.Dispatch<React.SetStateAction<MapMarkerData[]>>
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
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

let delayTimer

export const MapClusterer = ({
  mapMarkers,
  infoWindowIndex,
  setInfoWindowIndex,
  setVisibleMarkers,
  visibleMarkers,
  setIsLoading,
}: ListingsMapMarkersProps) => {
  const { listingsService } = useContext(AuthContext)
  const [markers, setMarkers] = useState<{
    [key: string]: google.maps.marker.AdvancedMarkerElement
  }>({})
  const [infoWindowContent, setInfoWindowContent] = useState<React.JSX.Element>(null)
  const [boundsLoading, setBoundsLoading] = useState(true)

  const map = useMap()

  const resetVisibleMarkers = () => {
    const bounds = map.getBounds()
    const newVisibleMarkers = mapMarkers.filter((marker) => bounds.contains(marker.coordinate))
    if (!visibleMarkers && newVisibleMarkers.length === 0) return
    setVisibleMarkers(newVisibleMarkers)
  }

  map.addListener("idle", () => {
    setIsLoading(true)
    clearTimeout(delayTimer)
    delayTimer = setTimeout(resetVisibleMarkers, 800)
  })

  const fetchInfoWindow = async (listingId: string) => {
    try {
      const response = await listingsService.retrieve({ id: listingId, view: ListingViews.base })
      setInfoWindowContent(getListingCard(response, infoWindowIndex))
    } catch (e) {
      console.log("ListingService.searchMapMarkers error: ", e)
    }
  }

  const clusterer: MarkerClusterer = useMemo(() => {
    if (!map) return null

    return new MarkerClusterer({
      map,
      renderer: {
        render: (cluster) => {
          const clusterMarker = document.createElement("div")
          clusterMarker.className = styles["cluster-icon"]
          clusterMarker.textContent = cluster.count.toString()
          const DEFAULT_REM = 1.5
          const calculatedSize = DEFAULT_REM + 0.02 * cluster.count
          clusterMarker.style.width = `${calculatedSize}rem`
          clusterMarker.style.height = `${calculatedSize}rem`

          return new google.maps.marker.AdvancedMarkerElement({
            map,
            position: cluster.position,
            content: clusterMarker,
            title: `${cluster.count} listings in this cluster`,
          })
        },
      },
      onClusterClick: (_, cluster, map) => {
        setInfoWindowIndex(null)
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

    // Only automatically size the map to fit all pins on first map load
    if (boundsLoading === false) return

    const visibleMarkers = mapMarkers?.filter((marker) =>
      map.getBounds()?.contains(marker.coordinate)
    )

    if (visibleMarkers.length === 0) {
      return
    } else {
      map.fitBounds(bounds, document.getElementById("listings-map").clientWidth * 0.05)
      setBoundsLoading(false)
    }
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

  const handleMarkerClick = useCallback(async (marker: MapMarkerData) => {
    await fetchInfoWindow(marker.id)
    setInfoWindowIndex(marker.key)
    map.panTo(marker.coordinate)
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
          onCloseClick={() => {
            setInfoWindowContent(null)
            setInfoWindowIndex(null)
          }}
          className={"info-window"}
          minWidth={250}
          maxWidth={500}
          disableAutoPan={false}
        >
          {infoWindowContent}
        </InfoWindow>
      )}
    </>
  )
}
