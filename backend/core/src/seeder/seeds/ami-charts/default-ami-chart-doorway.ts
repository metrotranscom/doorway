import { AmiChartDefaultSeed, getDefaultAmiChart } from "./default-ami-chart"
import { jurisNames } from "../jurisdictions"

export class AmiDefaultDoorway extends AmiChartDefaultSeed {
  async seed() {
    const promiseArr = jurisNames.map(async (name) => {
      const doorwayJurisdiction = await this.jurisdictionRepository.findOneOrFail({
        where: { name: name },
      })
      console.log(doorwayJurisdiction)
      return await this.amiChartRepository.save({
        ...getDefaultAmiChart(),
        name: `${name} - HUD`,
        jurisdiction: doorwayJurisdiction,
      })
    })

    return await Promise.all(promiseArr)
  }
}
