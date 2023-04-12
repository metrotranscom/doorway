import axios from "axios"
import { Jurisdiction, Response, UrlInfo } from "../types"

export class Extractor {
  urlInfo: UrlInfo
  jurisdictions: Array<Jurisdiction>
  //endpoints: Array<string>

  constructor(urlInfo: UrlInfo, jurisdictions: Array<Jurisdiction>) {
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

  public async extract(): Promise<Array<any>> {
    const actions = []

    this.jurisdictions.forEach((jurisdiction: Jurisdiction) => {
      console.log(`Fetching listings for [${jurisdiction.name}]`)
      const endpoint = this.constructEndpoint(jurisdiction.id)

      actions.push(
        axios
          .get<Response>(endpoint)
          .catch((error) => {
            console.log(error)
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

        console.log(`Retrieved ${respItems.length} listings from [${result.jurisdiction.name}]`)

        respItems.forEach((listing) => {
          items.push(listing)
        })
      })

      console.log(
        `Extract Results: ${items.length} listings fetched from ${this.jurisdictions.length} jurisdictions`
      )

      return items
    })
  }
}
