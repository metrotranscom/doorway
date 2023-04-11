import { Extractor } from "./extractor"
import { Transformer } from "./transformer"
import { Loader } from "./loader"

export class Runner {
  extractor: Extractor
  transformer: Transformer
  loader: Loader


  constructor(extractor: Extractor, transformer: Transformer, loader: Loader) {
    this.extractor = extractor
    this.transformer = transformer
    this.loader = loader
  }

  public async init() {
    await this.loader.connect()
  }

  public async run() {
    const results = await this.extractor.extract()

    const rows = results.map( (listing) => {
      return this.transformer.mapObjToRow(listing)
    })

    await this.loader.load(rows)
  }

  public async shutdown() {
    this.loader.closeConnection()
  }
}
