import {  Listing } from "../../types"

export interface ExtractorInterface {
  extract(): Promise<Array<Listing>>
}
