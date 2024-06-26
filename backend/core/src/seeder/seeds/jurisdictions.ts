import { INestApplicationContext } from "@nestjs/common"
import { JurisdictionCreateDto } from "../../jurisdictions/dto/jurisdiction-create.dto"
import { Language } from "../../shared/types/language-enum"
import { JurisdictionsService } from "../../jurisdictions/services/jurisdictions.service"
import { UserRoleEnum } from "../../../src/auth/enum/user-role-enum"
import { DoorwayJurisdictions } from "../../../src/shared/types/doorway-jurisdictions"

export const basicJurisInfo: JurisdictionCreateDto = {
  name: "",
  multiselectQuestions: [],
  languages: [Language.en],
  publicUrl: "http://localhost:3000",
  notificationsSignUpURL: "https://public.govdelivery.com/accounts/CAMTC/signup/36832",
  emailFromAddress: "Bay Area: Housing Bay Area <bloom-no-reply@exygy.dev>",
  rentalAssistanceDefault:
    "[Bay Area seed] Housing Choice Vouchers, Section 8 and other valid rental assistance programs will be considered for this property. In the case of a valid rental subsidy, the required minimum income will be based on the portion of the rent that the tenant pays after use of the subsidy.",
  enablePartnerSettings: true,
  enableAccessibilityFeatures: false,
  enableUtilitiesIncluded: true,
  enableListingOpportunity: false,
  enableGeocodingPreferences: true,
  listingApprovalPermissions: [UserRoleEnum.admin],
}

const activeJurisdictions: JurisdictionCreateDto[] = Object.values(DoorwayJurisdictions).map(
  (name) => {
    return { ...basicJurisInfo, name: name }
  }
)

export async function createJurisdictions(app: INestApplicationContext) {
  const jurisdictionService = await app.resolve<JurisdictionsService>(JurisdictionsService)
  // some jurisdictions are added via previous migrations
  const baseJurisdictions = await jurisdictionService.list()
  const toUpdate = []
  const toInsert = []
  const unchanged = []

  //classify which jurisdictions need to be added, updated or mantained
  activeJurisdictions.forEach((activeJuris) => {
    const existingJuris = baseJurisdictions.find((item) => item.name === activeJuris.name)
    if (!existingJuris) {
      toInsert.push(activeJuris)
    } else {
      const activeKeys = Object.keys(activeJuris)
      let updateNeeded = false
      let keyIdx = 0
      // comparison on each jurisdiction field to determine if update is required
      while (!updateNeeded && keyIdx < activeKeys.length) {
        const currKey = activeKeys[keyIdx]
        if (activeJuris[currKey] !== existingJuris[currKey]) {
          updateNeeded = true
        }
        keyIdx++
      }
      updateNeeded ? toUpdate.push(existingJuris) : unchanged.push(existingJuris)
    }
  })

  //updating existing jurisdictions
  const updated = await Promise.all(
    toUpdate.map(async (jurisdiction) => {
      const activeJuris = activeJurisdictions.find((def) => jurisdiction.name === def.name)
      const jurisdictionUpdated = {
        ...jurisdiction,
        ...activeJuris,
      }
      return await jurisdictionService.update(jurisdictionUpdated)
    })
  )

  // inserting new jurisdictions
  const inserted = await Promise.all(
    toInsert.map(async (jurisdiction) => {
      return await jurisdictionService.create(jurisdiction)
    })
  )

  const completeJurisdictions = [...unchanged, ...updated, ...inserted]

  return completeJurisdictions.sort((a, b) => (a.name < b.name ? -1 : 1))
}
