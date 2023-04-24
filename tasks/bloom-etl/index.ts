import { Runner, Extractor, Transformer, Loader, defaultMap } from "./src/etl"
import { DbConfig, Jurisdiction, UrlInfo } from "./src/types"
import { knex } from "knex"
import axios from "axios"

// No need to retrieve these dynamically since they never change, per Exygy
const jurisdictions: Array<Jurisdiction> = [
  {
    id: "3d0a7a32-345e-4ca6-86d8-66e51d6082db",
    name: "San Jose",
  },
  {
    id: "3328e8df-e064-4d9c-99cc-467ba43dd2de",
    name: "San Mateo",
  },
  {
    id: "bab6cb4f-7a5a-4ee5-b327-0c2508807780",
    name: "Alameda",
  },
]

// This is also unlikely to change during the lifetime of this task
const url: UrlInfo = {
  base: process.env.EXTERNAL_ENDPOINT_URL || "https://proxy.housingbayarea.org",
  path: process.env.EXTERNAL_ENDPOINT_PATH || "/listings",
}

const dbConfig: DbConfig = {
  client: "pg",
  connection: process.env.DATABASE_URL,
}

/* 
This is set in backend/core, and since changing a table name is a significant
effort, it's assumed that 1) it is very unlikely to happen over the short 
lifetime of this task and 2) changing a var somewhere in the same repo is 
actually less intrusive than changing an env var elsewhere.
*/
const tableName = "external_listings"

const runner = new Runner(
  new Extractor(axios, url, jurisdictions),
  new Transformer(defaultMap),
  new Loader(knex(dbConfig), tableName)
)

runner.run().catch((error) => {
  console.error(error)
})