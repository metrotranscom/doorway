import React from "react"
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api"
import { Listing } from "@bloom-housing/backend-core/types"

type ListingMapProps = {
  listing: Listing
  googleMapsHref: string
}

const containerStyle = {
  display: "block",
  width: "100%",
  height: "400px",
}

const ListingMap = (props: ListingMapProps) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.googleMapsApiKey,
  })

  const listing = props.listing
  const latitudeLongitude = {
    lat: listing.buildingAddress.latitude,
    lng: listing.buildingAddress.longitude,
  }
  const marker =
    <Marker
      position={ latitudeLongitude }
    ></Marker>

  

  return isLoaded ? (
    <a href={props.googleMapsHref}>
        <div className="listing-map">
            <GoogleMap mapContainerStyle={containerStyle} center={latitudeLongitude} zoom={13}>
            {marker}
            </GoogleMap>
        </div>
    </a>
  ) : (
    <></>
  )
}

export { ListingMap as default, ListingMap }
