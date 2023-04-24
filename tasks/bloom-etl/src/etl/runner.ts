import { ExtractorInterface, TransformerInterface, LoaderInterface } from "./"
import { Logger } from "./logger"

export class Runner {
  extractor: ExtractorInterface
  transformer: TransformerInterface
  loader: LoaderInterface
  logger: Logger

  constructor(
    extractor: ExtractorInterface,
    transformer: TransformerInterface,
    loader: LoaderInterface
  ) {
    this.extractor = extractor
    this.transformer = transformer
    this.loader = loader
    this.logger = new Logger()
  }

  public enableOutputLogging(enable: boolean) {
    this.logger.printLogs = enable
    this.extractor.getLogger().printLogs = enable
    this.transformer.getLogger().printLogs = enable
    this.loader.getLogger().printLogs = enable
  }

  public init() {
    this.loader.open()
  }

  public async run() {
    try {
      this.logger.log("---- INITIALIZING RUNNER ----")
      this.init()

      this.logger.log("---- FETCHING LISTINGS ----")
      const results = await this.extractor.extract()

      this.logger.log("---- TRANSFORMING LISTINGS ----")
      const rows = this.transformer.mapAll(results)

      this.logger.log("---- LOADING NEW LISTINGS INTO DATABASE ----")

      // the await is required to keep shutdown from happening before load completes
      // we want shutdown to happen in the finally block rather than catching on each op
      /* eslint-disable @typescript-eslint/await-thenable */
      await this.loader.load(rows)
      this.logger.log("---- ETL RUN COMPLETE ----")
    } finally {
      this.logger.log("---- SHUTTING DOWN RUNNER ----")
      this.shutdown()
    }
  }

  public shutdown() {
    this.loader.close()
  }
}