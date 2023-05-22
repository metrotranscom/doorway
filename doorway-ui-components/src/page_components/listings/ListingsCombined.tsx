import * as React from "react"
import { Listing } from "@bloom-housing/backend-core/types"
import { ListingsMap } from "./ListingsMap"
import { ListingsList } from "./ListingsList"
import "./ListingsCombined.scss"
import { ListingCard } from "../../.."

type ListingsCombinedProps = {
  listings: Listing[]
  listingCards: JSX.Element[]
  listingUrls: string[]
  googleMapsApiKey: string
}

const ListingsCombined = (props: ListingsCombinedProps) => (
  <div className="listings-combined">
    <div style={{ flex: "1" }}>
      <ListingsMap
        listings={props.listings}
        listingCards={props.listingCards}
        listingUrls={props.listingUrls}
        googleMapsApiKey={props.googleMapsApiKey}
      />
    </div>
    <div style={{ overflowY: "auto", width: "600px" }}>
      <ListingsList listingCards={props.listingCards}></ListingsList>
    </div>
  </div>
)
export { ListingsCombined as default, ListingsCombined }
