import { ExtractorInterface, TransformerInterface, LoaderInterface } from "./"

export class Runner {
  extractor: ExtractorInterface
  transformer: TransformerInterface
  loader: LoaderInterface

  constructor(extractor: ExtractorInterface, transformer: TransformerInterface, loader: LoaderInterface) {
    this.extractor = extractor
    this.transformer = transformer
    this.loader = loader
  }

  public init() {
    this.loader.open()
  }

  public async run() {
    try {
      console.log("---- INITIALIZING RUNNER ----")
      this.init()

      console.log("---- FETCHING LISTINGS ----")
      const results = await this.extractor.extract()

      console.log("---- TRANSFORMING LISTINGS ----")
      const rows = this.transformer.mapAll(results)

      console.log("---- LOADING NEW LISTINGS INTO DATABASE ----")
      await this.loader.load(rows)
    } finally {
      console.log("---- SHUTTING DOWN RUNNER ----")
      await this.shutdown()
    }
  }

  public async shutdown() {
    await this.loader.close()
  }
}
