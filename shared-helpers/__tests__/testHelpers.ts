import {
  AlternateContactRelationship,
  Application,
  ApplicationMethodsTypeEnum,
  ApplicationStatusEnum,
  ApplicationSubmissionTypeEnum,
  HouseholdMemberRelationship,
  IncomePeriodEnum,
  Jurisdiction,
  LanguagesEnum,
  Listing,
  ListingsStatusEnum,
  MultiselectQuestion,
  MultiselectQuestionsApplicationSectionEnum,
  ReviewOrderTypeEnum,
  Unit,
  UnitTypeEnum,
  YesNoEnum,
} from "../src/types/backend-swagger"

export const multiselectQuestionPreference: MultiselectQuestion = {
  id: "id1",
  text: "Live/Work in County",
  subText: "Live/Work in County subtitle",
  jurisdictions: [{ id: "1", name: "Alameda" }],
  createdAt: new Date("2022-09-14T22:53:09.982Z"),
  updatedAt: new Date("2022-09-15T22:53:09.982Z"),
  description: "At least one household member lives or works in County",
  links: [
    {
      title: "Live/Work in County Link Title",
      url: "https://www.example.com",
    },
  ],
  optOutText: "I don't want this preference",
  options: [
    {
      text: "Live in County",
      ordinal: 1,
      description: "A description of the option.",
      links: [
        {
          title: "Live in County Link Title",
          url: "https://www.example.com",
        },
      ],
      collectAddress: false,
    },
    { text: "Work in County", ordinal: 1, collectAddress: false },
  ],
  applicationSection: MultiselectQuestionsApplicationSectionEnum.preferences,
}

export const user = {
  agreedToTermsOfService: false,
  confirmedAt: new Date(),
  createdAt: new Date("2022-09-04T17:13:31.513Z"),
  dob: new Date(),
  email: "first.last@bloom.com",
  failedLoginAttemptsCount: 0,
  firstName: "First",
  hitConfirmationURL: undefined,
  id: "user_1",
  jurisdictions: [
    { id: "e50e64bc-4bc8-4cef-a4d1-1812add9981b" },
    { id: "d6b652a0-9947-418a-b69b-cd72028ed913" },
  ],
  language: undefined,
  lastLoginAt: new Date(),
  lastName: "Last",
  leasingAgentInListings: [],
  mfaEnabled: true,
  middleName: "Middle",
  passwordUpdatedAt: new Date(),
  passwordValidForDays: 180,
  phoneNumber: undefined,
  phoneNumberVerified: false,
  userRoles: {
    user: { id: "user_1" },
    isAdmin: true,
    isJurisdictionalAdmin: false,
    isPartner: false,
  },
  updatedAt: new Date(),
}

export const application: Application = {
  id: "application_1",
  createdAt: new Date(),
  updatedAt: new Date(),
  applicationLotteryPositions: [],
  applicant: {
    id: "applicant_id",
    createdAt: new Date(),
    updatedAt: new Date(),
    firstName: "Applicant First",
    middleName: "Applicant Middle",
    lastName: "Applicant Last",
    emailAddress: `first.last@example.com`,
    noEmail: false,
    phoneNumber: "(123) 123-1231",
    phoneNumberType: "home",
    noPhone: false,
    birthDay: "10",
    birthMonth: "10",
    birthYear: "1990",
    applicantAddress: {
      id: "applicant_address_id",
      createdAt: new Date(),
      updatedAt: new Date(),
      placeName: "Yellowstone National Park",
      city: "Yellowstone National Park",
      state: "WY",
      street: "3200 Old Faithful Inn Rd",
      zipCode: "82190",
      latitude: 44.459928576661824,
      longitude: -110.83109211487681,
    },
    applicantWorkAddress: {
      id: "applicant_work_address_id",
      createdAt: new Date(),
      updatedAt: new Date(),
      placeName: "Yosemite National Park",
      city: "Yosemite Valley",
      state: "CA",
      street: "9035 Village Dr",
      zipCode: "95389",
      latitude: 37.7487501,
      longitude: -119.5920354,
    },
  },
  householdSize: 2,
  income: "40000",
  incomePeriod: IncomePeriodEnum.perYear,
  submissionType: ApplicationSubmissionTypeEnum.electronical,
  submissionDate: new Date(),
  confirmationCode: "ABCD1234",
  incomeVouchers: [],
  additionalPhoneNumber: "(456) 456-4564",
  additionalPhoneNumberType: "cell",
  sendMailToMailingAddress: true,
  applicationsMailingAddress: {
    id: "applicant_work_address_id",
    createdAt: new Date(),
    updatedAt: new Date(),
    placeName: "Rocky Mountain National Park",
    city: "Estes Park",
    state: "CO",
    street: "1000 US-36",
    zipCode: "80517",
    latitude: 40.3800984,
    longitude: -105.5709864,
  },
  markedAsDuplicate: false,
  status: ApplicationStatusEnum.submitted,
  demographics: {
    id: "demographics_id",
    createdAt: new Date(),
    updatedAt: new Date(),
    ethnicity: undefined,
    howDidYouHear: [],
    race: [],
  },
  accessibility: {
    id: "accessibility_id",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  preferredUnitTypes: [],
  householdMember: [
    {
      id: "hh_member_id",
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: "Household First",
      lastName: "Household Last",
      birthDay: "25",
      birthMonth: "11",
      birthYear: "1966",
      relationship: HouseholdMemberRelationship.friend,
      sameAddress: YesNoEnum.no,
      householdMemberAddress: {
        id: "applicant_work_address_id",
        createdAt: new Date(),
        updatedAt: new Date(),
        placeName: "Arches National Park",
        city: "Moab",
        state: "UT",
        street: "25 E Center St",
        zipCode: "84532",
        latitude: 38.6190099,
        longitude: -109.6969108,
      },
    },
  ],
  alternateContact: {
    id: "alternate_contact_id",
    createdAt: new Date(),
    updatedAt: new Date(),
    type: AlternateContactRelationship.caseManager,
    firstName: "Alternate First",
    lastName: "Alternate Last",
    agency: "Alternate Agency",
    emailAddress: "alternate@email.com",
    phoneNumber: "(789) 012-3456",
    address: {
      id: "applicant_work_address_id",
      createdAt: new Date(),
      updatedAt: new Date(),
      placeName: "Acadia National Park",
      city: "Bay Harbor",
      state: "ME",
      street: "25 Visitor Center Rd",
      zipCode: "04609",
      latitude: 44.4089658,
      longitude: -68.3173111,
    },
  },
  applicationsAlternateAddress: {
    id: "applicant_work_address_id",
    createdAt: new Date(),
    updatedAt: new Date(),
    placeName: "Grand Canyon National Park",
    city: "Grand Canyon Village",
    state: "AZ",
    street: "S Entrance Rd",
    zipCode: "86023",
    latitude: 36.016779,
    longitude: -112.15888,
  },
  listings: {
    id: "Uvbk5qurpB2WI9V6WnNdH",
  },
}

export const unit: Unit = {
  id: "sQ19KuyILEo0uuNqti2fl",
  amiPercentage: "45.0",
  annualIncomeMin: "26496.0",
  monthlyIncomeMin: "2208.0",
  floor: 2,
  annualIncomeMax: "46125.0",
  maxOccupancy: 2,
  minOccupancy: 1,
  monthlyRent: "1104.0",
  numBathrooms: undefined,
  numBedrooms: undefined,
  number: undefined,
  unitAccessibilityPriorityTypes: undefined,
  sqFeet: "285",

  unitTypes: {
    id: "random_id_35edf",
    createdAt: new Date(),
    updatedAt: new Date(),
    name: UnitTypeEnum.studio,
    numBedrooms: 0,
  },
  createdAt: new Date("2019-07-09T21:20:05.783Z"),
  updatedAt: new Date("2019-08-14T23:05:43.913Z"),
  monthlyRentAsPercentOfIncome: undefined,
}

export const jurisdiction: Jurisdiction = {
  name: "Alameda",
  notificationsSignUpUrl: "https://public.govdelivery.com/accounts/CAMTC/signup/36832",
  languages: [LanguagesEnum.en],
  partnerTerms: undefined,
  publicUrl: "",
  emailFromAddress: "Alameda: Housing Bay Area <bloom-no-reply@exygy.dev>",
  rentalAssistanceDefault:
    "Housing Choice Vouchers, Section 8 and other valid rental assistance programs will be considered for this property. In the case of a valid rental subsidy, the required minimum income will be based on the portion of the rent that the tenant pays after use of the subsidy.",
  enablePartnerSettings: true,
  enableListingOpportunity: false,
  enableGeocodingPreferences: false,
  id: "67c22813-6080-441d-a496-03f2d06f2635",
  createdAt: new Date("2023-02-06T22:32:30.397Z"),
  updatedAt: new Date("2023-02-21T21:57:58.346Z"),
  listingApprovalPermissions: [],
  duplicateListingPermissions: [],
  multiselectQuestions: [
    {
      id: "d2553d08-6095-40b9-a1e2-c95349effe72",
    },
    {
      id: "ca6fedaa-911a-448f-9f54-8d7da4215eaa",
    },
    {
      id: "f808e2a5-6957-4abe-b047-aa933d8ecbb6",
    },
    {
      id: "a49c3e9d-eb97-43e1-9bc6-22ba2de9c38b",
    },
    {
      id: "7064c93b-ec8f-47d5-982b-4a814d322cf3",
    },
    {
      id: "2a13d954-35eb-4824-8616-749ae0bae789",
    },
    {
      id: "3ada9148-b806-40e4-b92b-e0a521910214",
    },
    {
      id: "02de4422-7f5e-41ff-b26a-b24f4e1ec181",
    },
    {
      id: "e847c9bf-4c32-4f02-8746-e9b20e0872af",
    },
  ],
  allowSingleUseCodeLogin: false,
}

export const listing: Listing = {
  id: "Uvbk5qurpB2WI9V6WnNdH",
  applicationLotteryTotals: [],
  applicationConfig: undefined,
  applicationOpenDate: new Date("2019-12-31T15:22:57.000-07:00"),
  listingsApplicationPickUpAddress: undefined,
  applicationPickUpAddressOfficeHours: "",
  listingsApplicationDropOffAddress: undefined,
  applicationDropOffAddressOfficeHours: undefined,
  listingsApplicationMailingAddress: undefined,
  jurisdictions: {
    id: "id",
    name: "San Jose",
  },
  depositMax: "",
  disableUnitsAccordion: false,
  listingEvents: [],
  showWaitlist: false,
  reviewOrderType: ReviewOrderTypeEnum.firstComeFirstServe,
  urlSlug: "listing-slug-abcdef",
  whatToExpect: "Applicant will be contacted. All info will be verified. Be prepared if chosen.",
  status: ListingsStatusEnum.active,
  postmarkedApplicationsReceivedByDate: new Date("2019-12-05"),
  applicationDueDate: new Date("2019-12-31T15:22:57.000-07:00"),
  applicationMethods: [
    {
      type: ApplicationMethodsTypeEnum.Internal,
      label: "Label",
      externalReference: "",
      acceptsPostmarkedApplications: false,
      phoneNumber: "123",
      id: "cd42843a-c251-4bcd-97ed-8f6c34752f01",
      createdAt: new Date(),
      updatedAt: new Date(),
      paperApplications: [],
    },
  ],
  applicationOrganization: "98 Archer Place",
  assets: [
    {
      id: "1234",
      createdAt: new Date(),
      updatedAt: new Date(),
      label: "building",
      fileId:
        "https://regional-dahlia-staging.s3-us-west-1.amazonaws.com/listings/archer/archer-studios.jpg",
    },
  ],
  buildingSelectionCriteria:
    "Tenant Selection Criteria will be available to all applicants upon request.",
  costsNotIncluded:
    "Resident responsible for PG&E, internet and phone.  Owner pays for water, trash, and sewage.  Residents encouraged to obtain renter's insurance but this is not a requirement.  Rent is due by the 5th of each month. Late fee $35 and returned check fee is $35 additional.",
  creditHistory:
    "Applications will be rated on a score system for housing. An applicant's score may be impacted by negative tenant peformance information provided to the credit reporting agency.  All applicants are expected have a passing acore of 70 points out of 100 to be considered for housing.  Applicants with no credit history will receive a maximum of 80 points to fairly outweigh positive and/or negative trades as would an applicant with established credit history. Refer to Tenant Selection Criteria or Qualification Criteria for details related to the qualification process. ",
  depositMin: "1140.0",
  programRules:
    "Applicants must adhere to minimum & maximum income limits. Tenant Selection Criteria applies.",
  waitlistMaxSize: 300,
  name: "Archer Studios",
  waitlistCurrentSize: 300,
  waitlistOpenSpots: 0,
  isWaitlistOpen: true,
  displayWaitlistSize: false,
  requiredDocuments: "Completed application and government issued IDs",
  createdAt: new Date("2019-07-08T15:37:19.565-07:00"),
  updatedAt: new Date("2019-07-09T14:35:11.142-07:00"),
  applicationFee: "30.0",
  criminalBackground:
    "A criminal background investigation will be obtained on each applicant.  As criminal background checks are done county by county and will be ran for all counties in which the applicant lived,  Applicants will be disqualified for tenancy if they have been convicted of a felony or misdemeanor.  Refer to Tenant Selection Criteria or Qualification Criteria for details related to the qualification process. ",
  listingsLeasingAgentAddress: {
    id: "id",
    createdAt: new Date(),
    updatedAt: new Date(),
    city: "Dixon",
    street: "98 Archer Place",
    zipCode: "95620",
    state: "CA",
    latitude: 37.44522,
    longitude: -121.81524,
  },
  leasingAgentEmail: "mbaca@charitieshousing.org",
  leasingAgentName: "Marisela Baca",
  leasingAgentOfficeHours: "Monday, Tuesday & Friday, 9:00AM - 5:00PM",
  leasingAgentPhone: "(408) 217-8562",
  leasingAgentTitle: "",
  listingMultiselectQuestions: [],
  rentalAssistance: "Custom rental assistance",
  rentalHistory:
    "Two years of rental history will be verified with all applicable landlords.  Household family members and/or personal friends are not acceptable landlord references.  Two professional character references may be used in lieu of rental history for applicants with no prior rental history.  An unlawful detainer report will be processed thourhg the U.D. Registry, Inc. Applicants will be disqualified if they have any evictions filing within the last 7 years.  Refer to Tenant Selection Criteria or Qualification Criteria for details related to the qualification process.",
  householdSizeMin: 2,
  householdSizeMax: 3,
  smokingPolicy: "Non-smoking building",
  unitsAvailable: 0,
  unitsSummary: [],
  unitsSummarized: undefined,
  unitAmenities: "Dishwasher",
  developer: "Charities Housing ",
  yearBuilt: 2012,
  accessibility:
    "There is a total of 5 ADA units in the complex, all others are adaptable. Exterior Wheelchair ramp (front entry)",
  amenities:
    "Community Room, Laundry Room, Assigned Parking, Bike Storage, Roof Top Garden, Part-time Resident Service Coordinator",
  buildingTotalUnits: 35,
  listingsBuildingAddress: {
    id: "buildingId",
    createdAt: new Date(),
    updatedAt: new Date(),
    county: "Solano",
    city: "Dixon",
    street: "98 Archer Place",
    zipCode: "95620",
    state: "CA",
    latitude: 37.44522,
    longitude: -121.81524,
  },
  neighborhood: "Rosemary Gardens Park",
  petPolicy:
    "No pets allowed. Accommodation animals may be granted to persons with disabilities via a reasonable accommodation request.",
  units: [
    unit,
    {
      id: "Cq870hwYXcPxCYT4_uW_3",
      amiPercentage: "45.0",
      annualIncomeMin: "26496.0",
      monthlyIncomeMin: "2208.0",
      floor: 3,
      annualIncomeMax: "46125.0",
      maxOccupancy: 2,
      minOccupancy: 1,
      monthlyRent: "1104.0",
      numBathrooms: undefined,
      numBedrooms: undefined,
      number: undefined,
      unitAccessibilityPriorityTypes: undefined,
      sqFeet: "285",

      unitTypes: {
        id: "random_id_35edf",
        createdAt: new Date(),
        updatedAt: new Date(),
        name: UnitTypeEnum.studio,
        numBedrooms: 0,
      },
      createdAt: new Date("2019-08-14T22:53:09.982Z"),
      updatedAt: new Date("2019-08-14T23:06:59.015Z"),
      monthlyRentAsPercentOfIncome: undefined,
    },
    {
      id: "9XQrfuAPOn8wtD7HlhCTR",
      amiPercentage: "45.0",
      annualIncomeMin: "26496.0",
      monthlyIncomeMin: "2208.0",
      floor: 2,
      annualIncomeMax: "46125.0",
      maxOccupancy: 2,
      minOccupancy: 1,
      monthlyRent: "1104.0",
      numBathrooms: undefined,
      numBedrooms: undefined,
      number: undefined,
      unitAccessibilityPriorityTypes: undefined,
      sqFeet: "285",

      unitTypes: {
        id: "random_id_35edf",
        createdAt: new Date(),
        updatedAt: new Date(),
        name: UnitTypeEnum.studio,
        numBedrooms: 0,
      },
      createdAt: new Date("2019-08-14T22:52:08.758Z"),
      updatedAt: new Date("2019-08-14T23:06:59.023Z"),
      monthlyRentAsPercentOfIncome: undefined,
    },
    {
      id: "bamrJpZA9JmnLSMEbTlI4",
      amiPercentage: "45.0",
      annualIncomeMin: "26496.0",
      monthlyIncomeMin: "2208.0",
      floor: 2,
      annualIncomeMax: "46125.0",
      maxOccupancy: 2,
      minOccupancy: 1,
      monthlyRent: "1104.0",
      numBathrooms: undefined,
      numBedrooms: undefined,
      number: undefined,
      unitAccessibilityPriorityTypes: undefined,
      sqFeet: "285",

      unitTypes: {
        id: "random_id_35edf",
        createdAt: new Date(),
        updatedAt: new Date(),
        name: UnitTypeEnum.studio,
        numBedrooms: 0,
      },
      createdAt: new Date("2019-08-14T22:52:08.766Z"),
      updatedAt: new Date("2019-08-14T23:06:59.031Z"),
      monthlyRentAsPercentOfIncome: undefined,
    },
    {
      id: "BCwOFAHJDpyPbKcVBjIUM",
      amiPercentage: "45.0",
      annualIncomeMin: "26496.0",
      monthlyIncomeMin: "2208.0",
      floor: 2,
      annualIncomeMax: "46125.0",
      maxOccupancy: 2,
      minOccupancy: 1,
      monthlyRent: "1104.0",
      numBathrooms: undefined,
      numBedrooms: undefined,
      number: undefined,
      unitAccessibilityPriorityTypes: undefined,
      sqFeet: "285",

      unitTypes: {
        id: "random_id_35edf",
        createdAt: new Date(),
        updatedAt: new Date(),
        name: UnitTypeEnum.studio,
        numBedrooms: 0,
      },
      createdAt: new Date("2019-08-14T22:52:08.771Z"),
      updatedAt: new Date("2019-08-14T23:06:59.039Z"),
      // amiChart: SanMateoHUD2019,
      monthlyRentAsPercentOfIncome: undefined,
    },
    {
      id: "5t56gXJdJLZiksBuX8BtL",
      amiPercentage: "45.0",
      annualIncomeMin: "26496.0",
      monthlyIncomeMin: "2208.0",
      floor: 2,
      annualIncomeMax: "46125.0",
      maxOccupancy: 2,
      minOccupancy: 1,
      monthlyRent: "1104.0",
      numBathrooms: undefined,
      numBedrooms: undefined,
      number: undefined,
      unitAccessibilityPriorityTypes: undefined,
      sqFeet: "285",

      unitTypes: {
        id: "random_id_35edf",
        createdAt: new Date(),
        updatedAt: new Date(),
        name: UnitTypeEnum.studio,
        numBedrooms: 0,
      },
      createdAt: new Date("2019-08-14T22:52:08.777Z"),
      updatedAt: new Date("2019-08-14T23:06:59.046Z"),
      monthlyRentAsPercentOfIncome: undefined,
    },
  ],
  isExternal: false,
}
