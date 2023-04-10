import { ListingFilterKeys } from "../../.."

export const combinedListingFilterTypeToFieldMap: Record<keyof typeof ListingFilterKeys, string> = {
  status: "status",
  name: "name",
  neighborhood: "neighborhood",
  bedrooms: "units->>'num_bedrooms'",
  zipcode: "building_address->>'zip_code'",
  leasingAgents: "leasing_agents->>'id'",
  jurisdiction: "jurisdiction->>'id'",
}
