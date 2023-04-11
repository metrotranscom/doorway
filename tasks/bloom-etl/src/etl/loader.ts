import { Client } from "pg"

export type DbConfig = {
  user: string,
  host: string,
  database: string,
  password: string
}


export class Loader {
  client: Client
  table: string

  constructor(config: DbConfig, table: string) {
    this.client = new Client(config)
    this.table = table
  }

  public async connect() {
    await this.client.connect()
  }

  public async load(rows: any) {

    try {
      await this.client.query('BEGIN')
      await this.client.query(`TRUNCATE TABLE "${this.table}"`)

      await this.client.query('COMMIT')
    } catch(e) {
      await this.client.query('ROLLBACK')
      throw e
    }
  }

  public async closeConnection() {
    this.client.end().catch( (error) => {
      console.log(error)
    })
  }
}

class Insert {
  table: string

  construct(table: string) {
    this.table = table
  }

  public setValues(values: any) {

  }

  public getParams(values: any) {

  }

  public toString(): string {
    let query = `INSERT INTO "${this.table}" (`

    query += ") VALUES ("

    return query + ")"
  }
}
