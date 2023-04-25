import * as React from "react"
import { ListingWithSourceMetadata } from "../../../types/ListingWithSourceMetadata"
import { ListingsMap } from "./ListingsMap"
import { ListingsList } from "./ListingsList"

type ListingsCombinedProps = {
  listings: ListingWithSourceMetadata[]
}
const parentStyle = {
  display: "flex",
  alignItems: "stretch",
  // TODO -- make this better
  height: "calc(100vh - 500px)",
}

const ListingsCombined = (props: ListingsCombinedProps) => (
  <div className="listings-combined" style={parentStyle}>
    <div style={{ flex: "1" }}>
      <ListingsMap listings={props.listings} />
    </div>
    <div style={{ overflowY: "auto", width: "400px" }}>
      <ListingsList listings={props.listings}></ListingsList>
    </div>
  </div>
)
export { ListingsCombined as default, ListingsCombined }
