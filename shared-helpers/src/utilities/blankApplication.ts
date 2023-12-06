import {
  ApplicationStatus,
  ApplicationSubmissionType,
  Language,
  ApplicationMultiselectQuestion,
} from "@bloom-housing/backend-core/types"

export const blankApplication = {
  loaded: false,
  autofilled: false,
  completedSections: 0,
  submissionType: ApplicationSubmissionType.electronical,
  language: Language.en,
  acceptedTerms: false,
  status: ApplicationStatus.submitted,
  applicant: {
    orderId: undefined,
    firstName: "",
    middleName: "",
    lastName: "",
    birthMonth: "",
    birthDay: "",
    birthYear: "",
    emailAddress: null,
    noEmail: false,
    phoneNumber: "",
    phoneNumberType: "",
    noPhone: false,
    workInRegion: null,
    address: {
      street: "",
      street2: "",
      city: "",
      state: "",
      zipCode: "",
      county: "",
      latitude: null,
      longitude: null,
    },
    workAddress: {
      street: "",
      street2: "",
      city: "",
      state: "",
      zipCode: "",
      county: "",
      latitude: null,
      longitude: null,
    },
  },
  additionalPhone: false,
  additionalPhoneNumber: "",
  additionalPhoneNumberType: "",
  contactPreferences: [],
  householdSize: 0,
  housingStatus: "",
  sendMailToMailingAddress: false,
  mailingAddress: {
    street: "",
    street2: "",
    city: "",
    state: "",
    zipCode: "",
  },
  alternateAddress: {
    street: "",
    street2: "",
    city: "",
    state: "",
    zipCode: "",
  },
  alternateContact: {
    type: "",
    otherType: "",
    firstName: "",
    lastName: "",
    agency: "",
    phoneNumber: "",
    emailAddress: null,
    mailingAddress: {
      street: "",
      street2: "",
      city: "",
      state: "",
      zipCode: "",
    },
  },
  accessibility: {
    mobility: null,
    vision: null,
    hearing: null,
  },
  householdExpectingChanges: null,
  householdStudent: null,
  incomeVouchers: null,
  rentalAssistance: null,
  income: null,
  incomePeriod: null,
  householdMembers: [],
  preferredUnit: [],
  demographics: {
    ethnicity: "",
    race: [],
    gender: "",
    sexualOrientation: "",
    howDidYouHear: [],
  },
  preferences: [] as ApplicationMultiselectQuestion[],
  programs: [] as ApplicationMultiselectQuestion[],
  confirmationCode: "",
  id: "",
}
