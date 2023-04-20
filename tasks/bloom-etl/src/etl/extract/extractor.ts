import { Axios } from "axios"
import { Jurisdiction, Listing, Response, UrlInfo } from "../../types"
import { ExtractorInterface } from "./extractor-interface"
import { BaseStage } from "../base-stage"

export class Extractor extends BaseStage implements ExtractorInterface {
  axios: Axios
  urlInfo: UrlInfo
  jurisdictions: Array<Jurisdiction>

  constructor(axios: Axios, urlInfo: UrlInfo, jurisdictions: Array<Jurisdiction>) {
    super()
    this.axios = axios
    this.urlInfo = urlInfo
    this.jurisdictions = jurisdictions
  }

  private constructEndpoint(id: string) {
    // Construct endpoint urls that gets base info for all listings for each jurisdiction individually
    // This enables us to maximize cache hits on the Bloom side
    const url =
      this.urlInfo.base +
      this.urlInfo.path +
      "?view=base&limit=all&filter[0][$comparison]==&filter[0][status]=active"

    return url + `&filter[1][$comparison]==&filter[1][jurisdiction]=${id}`
  }

  public async extract(): Promise<Array<Listing>> {
    const actions = []

    this.jurisdictions.forEach((jurisdiction: Jurisdiction) => {
      this.log(`Fetching listings for [${jurisdiction.name}]`)
      const endpoint = this.constructEndpoint(jurisdiction.id)

      actions.push(
        this.axios
          .get<Response>(endpoint)
          .catch((error) => {
            this.log(error)
            throw new Error("Unexpected HTTP error")
          })
          .then((response) => {
            return {
              response: response,
              jurisdiction: jurisdiction,
            }
          })
      )
    })

    return Promise.all(actions).then((responses) => {
      const items = []

      responses.forEach((result) => {
        const respItems = result.response.data.items

        this.log(`Retrieved ${respItems.length} listings from [${result.jurisdiction.name}]`)

        respItems.forEach((listing) => {
          items.push(listing)
        })
      })

      this.log(
        `Extract Results: ${items.length} listings fetched from ${this.jurisdictions.length} jurisdictions`
      )

      return items
    })
  }
}
