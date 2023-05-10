import { CombinedListingFilterKeys } from "./combined-listing-filter-keys-enum"

// REMOVE_WHEN_EXTERNAL_NOT_NEEDED
export const combinedListingFilterTypeToFieldMap: Record<
  keyof typeof CombinedListingFilterKeys,
  string
> = {
  status: "status",
  name: "name",
  neighborhood: "neighborhood",
  bedrooms: "min_bedrooms",
  zipcode: "building_address->>'zip_code'",
  leasingAgents: "leasing_agents->>'id'",
  jurisdiction: "jurisdiction->>'id'",
  isExternal: "is_external",
  county: "building_address->>'county'",
  city: "building_address->>'city'",
  minMonthlyRent: "min_monthly_rent",
  maxMonthlyRent: "max_monthly_rent",
  bathrooms: "units->>'num_bathrooms'",
}
