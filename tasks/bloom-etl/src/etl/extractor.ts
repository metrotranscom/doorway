import axios from "axios"

export type UrlInfo = {
  base: string,
  path: string
}

export class Extractor {
  endpoints: Array<string>

  constructor(urlInfo: UrlInfo, jurisdictions: Array<string>) {
    // Construct endpoint urls that gets base info for all listings for each jurisdiction individually
    // This enables us to maximize cache hits on the Bloom side
    this.endpoints = jurisdictions.map( (id) => {
      let url = urlInfo.base + urlInfo.path + "?view=base&limit=all&filter[0][$comparison]==&filter[0][status]=active"
      return url + `&filter[1][$comparison]==&filter[1][jurisdiction]=${id}`
    })
  }

  public async extract(): Promise<Array<any>> {
    const actions = []

    this.endpoints.forEach( async (endpoint) => {
      actions.push(axios.get(endpoint).catch( (error) => {
        console.log(error)
        throw new Error("Unexpected HTTP error")
      }))
    })

    return Promise.all(actions).then( (responses) => {
      const items = []

      responses.forEach( (resp) => {
        resp.data.items.forEach( (listing) => items.push(listing) )
      })

      return items
    })
  }
}
