import React, { useState } from "react"
import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from "@react-google-maps/api"
import { ListingElements } from "./ListingsCombined"

type ListingsMapProps = {
  listingElements: ListingElements[]
  googleMapsApiKey: string
}

const containerStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  position: "relative",
}

const center = {
  lat: 37.579795,
  lng: -122.374118,
}

interface MarkerInput {
  lat: number
  lng: number
  key: number
  infoWindow: JSX.Element
}

const ListingsMap = (props: ListingsMapProps) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: props.googleMapsApiKey,
  })

  const markers: MarkerInput[] = []
  props.listingElements.forEach((listingElements: ListingElements, index: number) => {
    const lat = listingElements.latitude
    const lng = listingElements.longitude
    const key = index + 1

    // Create an info window that is associated to each marker and that contains the listing card
    // for that listing.
    const infoWindow = (
      <InfoWindow position={{ lat: lat, lng: lng }}>{listingElements.listingCard}</InfoWindow>
    )
    markers.push({ lat, lng, key, infoWindow })
  })

  const [openInfoWindow, setOpenInfoWindow] = useState(false)
  const [infoWindowIndex, setInfoWindowIndex] = useState(0)

  return isLoaded ? (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={9}>
      {markers.map((marker) => (
        <Marker
          position={{ lat: marker.lat, lng: marker.lng }}
          label={{
            text: marker.key.toString(),
            color: "var(--bloom-color-white)",
            fontFamily: "var(--bloom-font-sans)",
            fontWeight: "700",
            fontSize: "var(--bloom-font-size-2xs)",
          }}
          onClick={() => {
            setOpenInfoWindow(true)
            setInfoWindowIndex(marker.key)
          }}
          key={marker.key.toString()}
          icon={{
            url: "/images/map-pin.svg",
            labelOrigin: new google.maps.Point(14, 15),
          }}
        >
          {/* Only display the info window when the corresponding marker has been clicked. */}
          {openInfoWindow && infoWindowIndex === marker.key && marker.infoWindow}
        </Marker>
      ))}
    </GoogleMap>
  ) : (
    <></>
  )
}

export { ListingsMap as default, ListingsMap }
