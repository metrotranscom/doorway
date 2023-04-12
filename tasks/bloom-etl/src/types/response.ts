import { Listing } from "./listing"

export class Response {
  items: Listing[]
  meta: {
    currentPage: number
    itemCount: number
    itemsPerPage: number
    totalItems: number
    totalPages: number
  }
}
