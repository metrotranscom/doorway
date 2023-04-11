
import { Extractor } from "./src/etl/extractor"
import { Transformer, defaultMap } from "./src/etl/transformer"
import { Loader } from "./src/etl/loader"
import { Runner } from "./src/etl/runner"

const url = {
  base: "https://proxy.housingbayarea.org",
  path: "/listings"
}

const jurisdictions = [
  "3d0a7a32-345e-4ca6-86d8-66e51d6082db", // San Jose
  "3328e8df-e064-4d9c-99cc-467ba43dd2de", // San Mateo
  "bab6cb4f-7a5a-4ee5-b327-0c2508807780", // Alameda
]

const dbConfig = {
  user: "bloom-dev",
  host: "localhost",
  database: "bloom",
  password: process.env.PGPASSWORD
}

const tableName = "external_listings"

const runner = new Runner(
  new Extractor(url, jurisdictions),
  new Transformer(defaultMap),
  new Loader(dbConfig, tableName)
)

runner.init().then( () =>
  runner.run()
).then( () => {
  runner.shutdown()
}).catch( (error) => {
  console.log(error)
})
