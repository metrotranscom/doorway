import * as React from "react"
import { Listing } from "@bloom-housing/backend-core/types"
import { ListingsMap } from "./ListingsMap"
import { ListingsList } from "./ListingsList"
import "./ListingsCombined.scss"

export type ListingElements = {
  latitude: number
  longitude: number
  listingCard: JSX.Element
}

type ListingsCombinedProps = {
  listingElements: ListingElements[]
  googleMapsApiKey: string
}

const ListingsCombined = (props: ListingsCombinedProps) => (
  <div className="listings-combined">
    <div style={{ flex: "1" }}>
      <ListingsMap
        listingElements={props.listingElements}
        googleMapsApiKey={props.googleMapsApiKey}
      />
    </div>
    <div style={{ overflowY: "auto", width: "600px" }}>
      <ListingsList listingElements={props.listingElements}></ListingsList>
    </div>
  </div>
)
export { ListingsCombined as default, ListingsCombined }
