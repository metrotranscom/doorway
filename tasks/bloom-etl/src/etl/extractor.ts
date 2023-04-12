import axios from "axios"

export type UrlInfo = {
  base: string,
  path: string
}

export class Extractor {
  urlInfo: UrlInfo
  jurisdictions: Array<{id: string, name: string}>
  //endpoints: Array<string>

  constructor(urlInfo: UrlInfo, jurisdictions: Array<{id: string, name: string}>) {
    // Construct endpoint urls that gets base info for all listings for each jurisdiction individually
    // This enables us to maximize cache hits on the Bloom side
    /*
    this.endpoints = jurisdictions.map( (id) => {
      let url = urlInfo.base + urlInfo.path + "?view=base&limit=all&filter[0][$comparison]==&filter[0][status]=active"
      return url + `&filter[1][$comparison]==&filter[1][jurisdiction]=${id}`
    })
    */
    this.urlInfo = urlInfo
    this.jurisdictions = jurisdictions
  }

  private constructEndpoint(id: string) {
    let url = this.urlInfo.base + this.urlInfo.path + "?view=base&limit=all&filter[0][$comparison]==&filter[0][status]=active"
    return url + `&filter[1][$comparison]==&filter[1][jurisdiction]=${id}`
  }

  public async extract(): Promise<Array<any>> {
    const actions = []

    this.jurisdictions.forEach( async (jurisdiction) => {
      console.log(`Fetching listings for [${jurisdiction.name}]`)
      const endpoint = this.constructEndpoint(jurisdiction.id)

      actions.push(axios.get(endpoint).catch( (error) => {
        console.log(error)
        throw new Error("Unexpected HTTP error")
      }).then( (response) => {
        return {
          response: response,
          jurisdiction: jurisdiction
        }
      }))
    })

    return Promise.all(actions).then( (responses) => {
      const items = []

      responses.forEach( (result) => {
        const respItems = result.response.data.items

        console.log(`Retrieved ${respItems.length} listings from [${result.jurisdiction.name}]`)

        respItems.forEach( (listing) => {
          items.push(listing) 
        })
      })

      console.log(`Extract Results: ${items.length} listings fetched from ${this.jurisdictions.length} jurisdictions`)
      return items
    })
  }
}
