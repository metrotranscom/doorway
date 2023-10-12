import { MigrationInterface, QueryRunner } from "typeorm"

export class addJurisdictions1695143897902 implements MigrationInterface {
  name = "addJurisdictions1695143897902"

  public async up(queryRunner: QueryRunner): Promise<void> {
    const baseJurisdiction = (
      await queryRunner.query(
        `SELECT * 
        FROM jurisdictions
        WHERE name='Bay Area'`
      )
    )[0]
    //add new jurisdictions
    const countyArr = ["Contra Costa", "Marin", "Napa", "Santa Clara", "Solano", "Sonoma"]
    countyArr.forEach(async (county) => {
      const newJuris = { ...baseJurisdiction, name: county }
      delete newJuris.id
      delete newJuris.created_at
      delete newJuris.updated_at
      const jurisKeys = Object.keys(newJuris).toString()
      const jurisValues = Object.values(newJuris)
      await queryRunner.query(
        `INSERT INTO jurisdictions (${jurisKeys}) 
        VALUES ($1, $2, $3,$4, $5, $6,$7, $8, $9, $10, $11)`,
        jurisValues
      )
    })

    //link existing listings to corresponding jurisdiction
    const existingListings = await queryRunner.query(
      `SELECT listings.id,county
       FROM listings 
       LEFT JOIN address on listings.building_address_id = address.id`
    )
    const existingJurisdictions = await queryRunner.query(
      `SELECT id,name
       FROM jurisdictions`
    )

    existingListings.forEach(async (listing) => {
      const matchingJuris = existingJurisdictions.find((juris) => juris.name === listing.county).id
      await queryRunner.query(
        `UPDATE listings
        SET jurisdiction_id='${matchingJuris}'
        WHERE id='${listing.id}'`
      )
    })

    //link existing ami charts to new jurisdictions
    const amiJurisMap = {
      "Marin - HUD": "Marin",
      "Napa - HUD": "Napa",
      "Contra Costa - HUD": "Contra Costa",
      "Santa Clara - HUD": "Santa Clara",
      "Solano - HUD": "Solano",
      "Sonoma - HUD": "Sonoma",
      "Sonoma - Sonoma County State and Local": "Sonoma",
      "Contra Costa - CA TCAC": "Contra Costa",
      "Marin - CA TCAC": "Marin",
      "Napa - CA TCAC": "Napa",
      "Santa Clara - CA TCAC": "Santa Clara",
      "Solano - CA TCAC": "Solano",
      "Sonoma - CA TCAC": "Sonoma",
      "Oakland 2023": "Bay Area",
    }
    const amiCharts = await queryRunner.query(
      `SELECT id,name
       FROM ami_chart`
    )
    amiCharts.forEach(async (ami) => {
      const matchingJuris = existingJurisdictions.find(
        (juris) => juris.name === amiJurisMap[ami.name]
      )?.id
      if (matchingJuris) {
        await queryRunner.query(
          `UPDATE ami_chart
          SET jurisdiction_id='${matchingJuris}'
          WHERE id='${ami.id}'`
        )
      }
    })
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
