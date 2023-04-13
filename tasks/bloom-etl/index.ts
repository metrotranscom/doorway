import { Extractor } from "./src/etl/extractor"
import { Transformer, defaultMap } from "./src/etl/transformer"
import { Loader } from "./src/etl/loader"
import { Runner } from "./src/etl/runner"
import { DbConfig, Jurisdiction, UrlInfo } from "./src/types"

// No need to retrieve these dynamically since they never change
const jurisdictions: Array<Jurisdiction> = [
  {
    id: "3d0a7a32-345e-4ca6-86d8-66e51d6082db",
    name: "San Jose"
  },
  {
    id: "3328e8df-e064-4d9c-99cc-467ba43dd2de",
    name: "San Mateo"
  },
  {
    id: "bab6cb4f-7a5a-4ee5-b327-0c2508807780",
    name: "Alameda"
  },
]

// This is also unlikely to change during the lifetime of this task
const url: UrlInfo = {
  base: "https://proxy.housingbayarea.org",
  path: "/listings"
}

const dbConfig: DbConfig = {
  client: "pg",
  connection: process.env.DATABASE_URL
}

/* 
This is set in backend/core, and since changing a table name is a significant
effort, it's assumed that 1) it is very unlikely to happen over the short 
lifetime of this task and 2) changing a var somewhere in the same repo is 
actually less intrusive than changing an env var elsewhere.
*/
const tableName = "external_listings"

const runner = new Runner(
  new Extractor(url, jurisdictions),
  new Transformer(defaultMap),
  new Loader(dbConfig, tableName)
)

runner.run().catch( (error) => {
  console.error(error)
})
