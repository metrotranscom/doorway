import { Axios } from "axios"
import { Jurisdiction, Listing, Response, UrlInfo } from "../../types"
import { ExtractorInterface } from "./extractor-interface"
import { BaseStage } from "../base-stage"

export class Extractor extends BaseStage implements ExtractorInterface {
  axios: Axios
  urlInfo: UrlInfo
  jurisdictions: Array<Jurisdiction>

  // This constructor uses dependency injection for axios to enable easier mocking
  constructor(axios: Axios, urlInfo: UrlInfo, jurisdictions: Array<Jurisdiction>) {
    super()
    this.axios = axios
    this.urlInfo = urlInfo
    this.jurisdictions = jurisdictions
  }

  private constructEndpoint(id: string) {
    // Construct endpoint urls that get base info for all listings for each
    // jurisdiction individually rather than all at once. This enables us to
    // parallelize fetches and maximize cache hits on the external API
    return (
      this.urlInfo.base +
      this.urlInfo.path +
      "?view=base&limit=all&filter[0][$comparison]==&filter[0][status]=active" +
      `&filter[1][$comparison]==&filter[1][jurisdiction]=${id}`
    )
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
