import React from "react"
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api"
import { Listing } from "@bloom-housing/shared-helpers/src/types/backend-swagger"

type ListingGoogleMapProps = {
  listing: Listing
  googleMapsHref: string
  googleMapsApiKey: string
}

const containerStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: "400px",
  position: "relative",
}

const ListingGoogleMap = (props: ListingGoogleMapProps) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: props.googleMapsApiKey,
  })

  const listing = props.listing
  const latitudeLongitude = {
    lat: listing.listingsBuildingAddress.latitude,
    lng: listing.listingsBuildingAddress.longitude,
  }
  const marker = (
    <Marker
      position={latitudeLongitude}
      icon={{
        url: "/images/map-pin.svg",
      }}
    ></Marker>
  )

  return isLoaded ? (
    <a href={props.googleMapsHref} target="_blank">
      <GoogleMap mapContainerStyle={containerStyle} center={latitudeLongitude} zoom={13}>
        {marker}
      </GoogleMap>
    </a>
  ) : (
    <></>
  )
}

export { ListingGoogleMap as default, ListingGoogleMap }
