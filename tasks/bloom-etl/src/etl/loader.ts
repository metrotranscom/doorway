import { Knex, knex } from "knex"

export type DbConfig = {
  client: string,
  connection: string
}

export class Loader {
  knex: Knex
  table: string
  txn: Knex.TransactionProvider

  constructor(config: DbConfig, table: string) {
    this.knex = knex(config)
    //this.client = new Client(config)
    this.table = table
  }

  public async open() {
    // set up the transaction
    console.log(`Loader: initializing transaction`)
    this.txn = await this.knex.transactionProvider()
  }

  public async load(rows: any) {
    // start the transaction
    const txn = await this.txn()

    try {
      // remove all existing records
      console.log(`Truncating records from table "${this.table}"`)
      await txn.raw(`TRUNCATE TABLE "${this.table}"`)
      // add new recrods
      console.log(`Adding ${rows.length} new rows into table`)
      await txn(this.table).insert(rows)
      // save changes
      console.log(`Committing database changes`)
      await txn.commit()
      console.log(`Load Results: import complete`)
    } catch(e) {
      await txn.rollback()
      throw e
    }
  }

  public async close() {
    try {
      console.log(`Loader: closing database connection`)
      this.knex.destroy()
    } catch (e) {
      console.log(e)
    }
  }
}
