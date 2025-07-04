import { ApplicationSubmissionTypeEnum } from '@prisma/client';
import { Address } from '../dtos/addresses/address.dto';
import { ApplicationFlaggedSet } from '../dtos/application-flagged-sets/application-flagged-set.dto';
import { ApplicationLotteryPosition } from '../dtos/applications/application-lottery-position.dto';
import { ApplicationMultiselectQuestion } from '../dtos/applications/application-multiselect-question.dto';
import { MultiselectQuestion } from '../dtos/multiselect-questions/multiselect-question.dto';
import { UnitType } from '../dtos/unit-types/unit-type.dto';
import { CsvHeader } from '../types/CsvExportInterface';
import { formatLocalDate } from '../utilities/format-local-date';

/**
 *
 * @param maxHouseholdMembers the max number of household members on an application
 * @param multiSelectQuestions the set of multiselect questions on the listing
 * @param timeZone the timezone to output dates in
 * @param includeDemographics whether to include demographic info or not
 * @param forLottery whether this is for lottery or not
 * @param dateFormat the format to output dates in
 * @returns the set of export headers
 */
export const getExportHeaders = (
  maxHouseholdMembers: number,
  multiSelectQuestions: MultiselectQuestion[],
  timeZone: string,
  includeDemographics = false,
  forLottery = false,
  dateFormat = 'MM-DD-YYYY hh:mm:ssA z',
): CsvHeader[] => {
  const headers: CsvHeader[] = [
    {
      path: 'id',
      label: 'Application Id',
    },
    {
      path: 'confirmationCode',
      label: 'Application Confirmation Code',
    },
  ];

  // if its for the lottery insert the lottery position
  if (forLottery) {
    headers.push({
      path: 'applicationLotteryPositions',
      label: 'Raw Lottery Rank',
      format: (val: ApplicationLotteryPosition[]): number => {
        if (val?.length) {
          return val[0].ordinal;
        }
      },
    });
  }

  headers.push(
    ...[
      {
        path: 'submissionType',
        label: 'Application Type',
        format: (val: string): string =>
          val === ApplicationSubmissionTypeEnum.electronical
            ? 'electronic'
            : val,
      },
      {
        path: 'submissionDate',
        label: 'Application Submission Date',
        format: (val: string): string =>
          formatLocalDate(val, dateFormat, timeZone ?? process.env.TIME_ZONE),
      },
      {
        path: 'receivedAt',
        label: 'Application Received At',
        format: (val: string): string =>
          formatLocalDate(val, dateFormat, timeZone ?? process.env.TIME_ZONE),
      },
      {
        path: 'receivedBy',
        label: 'Application Received By',
      },
      {
        path: 'applicant.firstName',
        label: 'Primary Applicant First Name',
      },
      {
        path: 'applicant.middleName',
        label: 'Primary Applicant Middle Name',
      },
      {
        path: 'applicant.lastName',
        label: 'Primary Applicant Last Name',
      },
      {
        path: 'applicant.birthDay',
        label: 'Primary Applicant Birth Day',
      },
      {
        path: 'applicant.birthMonth',
        label: 'Primary Applicant Birth Month',
      },
      {
        path: 'applicant.birthYear',
        label: 'Primary Applicant Birth Year',
      },
      {
        path: 'applicant.emailAddress',
        label: 'Primary Applicant Email Address',
      },
      {
        path: 'applicant.phoneNumber',
        label: 'Primary Applicant Phone Number',
      },
      {
        path: 'applicant.phoneNumberType',
        label: 'Primary Applicant Phone Type',
      },
      {
        path: 'additionalPhoneNumber',
        label: 'Primary Applicant Additional Phone Number',
      },
      {
        path: 'applicant.applicantAddress.street',
        label: `Primary Applicant Street`,
      },
      {
        path: 'applicant.applicantAddress.street2',
        label: `Primary Applicant Street 2`,
      },
      {
        path: 'applicant.applicantAddress.city',
        label: `Primary Applicant City`,
      },
      {
        path: 'applicant.applicantAddress.state',
        label: `Primary Applicant State`,
      },
      {
        path: 'applicant.applicantAddress.zipCode',
        label: `Primary Applicant Zip Code`,
      },
      {
        path: 'applicationsMailingAddress.street',
        label: `Primary Applicant Mailing Street`,
      },
      {
        path: 'applicationsMailingAddress.street2',
        label: `Primary Applicant Mailing Street 2`,
      },
      {
        path: 'applicationsMailingAddress.city',
        label: `Primary Applicant Mailing City`,
      },
      {
        path: 'applicationsMailingAddress.state',
        label: `Primary Applicant Mailing State`,
      },
      {
        path: 'applicationsMailingAddress.zipCode',
        label: `Primary Applicant Mailing Zip Code`,
      },
      {
        path: 'alternateContact.firstName',
        label: 'Alternate Contact First Name',
      },
      {
        path: 'alternateContact.lastName',
        label: 'Alternate Contact Last Name',
      },
      {
        path: 'alternateContact.type',
        label: 'Alternate Contact Type',
      },
      {
        path: 'alternateContact.agency',
        label: 'Alternate Contact Agency',
      },
      {
        path: 'alternateContact.otherType',
        label: 'Alternate Contact Other Type',
      },
      {
        path: 'alternateContact.emailAddress',
        label: 'Alternate Contact Email Address',
      },
      {
        path: 'alternateContact.phoneNumber',
        label: 'Alternate Contact Phone Number',
      },
      {
        path: 'alternateContact.address.street',
        label: `Alternate Contact Street`,
      },
      {
        path: 'alternateContact.address.street2',
        label: `Alternate Contact Street 2`,
      },
      {
        path: 'alternateContact.address.city',
        label: `Alternate Contact City`,
      },
      {
        path: 'alternateContact.address.state',
        label: `Alternate Contact State`,
      },
      {
        path: 'alternateContact.address.zipCode',
        label: `Alternate Contact Zip Code`,
      },
      {
        path: 'income',
        label: 'Income',
      },
      {
        path: 'incomePeriod',
        label: 'Income Period',
        format: (val: string): string =>
          val === 'perMonth' ? 'per month' : 'per year',
      },
      {
        path: 'accessibility.mobility',
        label: 'Accessibility Mobility',
      },
      {
        path: 'accessibility.vision',
        label: 'Accessibility Vision',
      },
      {
        path: 'accessibility.hearing',
        label: 'Accessibility Hearing',
      },
      {
        path: 'householdExpectingChanges',
        label: 'Expecting Household Changes',
      },
      {
        path: 'householdStudent',
        label: 'Household Includes Student or Member Nearing 18',
      },
      {
        path: 'incomeVouchers',
        label: 'Vouchers or Subsidies',
      },
      {
        path: 'preferredUnitTypes',
        label: 'Requested Unit Types',
        format: (val: UnitType[]): string => {
          return val.map((unit) => unitTypeToReadable(unit.name)).join(',');
        },
      },
    ],
  );

  // add preferences to csv headers
  const preferenceHeaders = constructMultiselectQuestionHeaders(
    'preferences',
    'Preference',
    multiSelectQuestions,
  );
  headers.push(...preferenceHeaders);

  // add programs to csv headers
  const programHeaders = constructMultiselectQuestionHeaders(
    'programs',
    'Program',
    multiSelectQuestions,
  );
  headers.push(...programHeaders);

  headers.push({
    path: 'householdSize',
    label: 'Household Size',
  });

  // add household member headers to csv
  if (maxHouseholdMembers) {
    headers.push(...getHouseholdCsvHeaders(maxHouseholdMembers));
  }

  headers.push(
    {
      path: 'markedAsDuplicate',
      label: 'Marked As Duplicate',
    },
    {
      path: 'applicationFlaggedSet',
      label: 'Flagged As Duplicate',
      format: (val: ApplicationFlaggedSet[]): boolean => {
        return val.length > 0;
      },
    },
  );

  if (includeDemographics) {
    headers.push(
      {
        path: 'demographics.race',
        label: 'Race',
        format: (val: string[]): string =>
          val
            ?.map((race) => convertDemographicRaceToReadable(race))
            .join(',') || '',
      },
      {
        path: 'demographics.gender',
        label: 'Gender',
        format: (val: string): string =>
          convertDemographicGenderToReadable(val),
      },
      {
        path: 'demographics.sexualOrientation',
        label: 'Sexual Orientation',
        format: (val: string): string =>
          convertDemographicSexualOrientationToReadable(val),
      },
      {
        path: 'demographics.spokenLanguage',
        label: 'Spoken Language',
        format: (val: string): string =>
          convertDemographicLanguageToReadable(val),
      },
      {
        path: 'demographics.howDidYouHear',
        label: 'How did you Hear?',
        format: (val: string[]): string =>
          val
            ?.map((howDidYouHear) =>
              convertDemographicHowDidYouHearToReadable(howDidYouHear),
            )
            .join(',') || '',
      },
    );
  }
  return headers;
};

/**
 *
 * @param applicationSection is this for programs or preferences
 * @param labelString prefix for header output
 * @param multiSelectQuestions the set of multiselect questions on the listing
 * @returns the set of headers
 */
export const constructMultiselectQuestionHeaders = (
  applicationSection: string,
  labelString: string,
  multiSelectQuestions: MultiselectQuestion[],
): CsvHeader[] => {
  const headers: CsvHeader[] = [];

  multiSelectQuestions
    .filter((question) => question.applicationSection === applicationSection)
    .forEach((question) => {
      headers.push({
        path: `${applicationSection}.${question.id}.claimed`,
        label: `${labelString} ${question.text}`,
        format: (val: any): string => {
          const claimedString: string[] = [];
          val?.options?.forEach((option) => {
            // Note: the option can be the opt out text so if it is checked
            // the opt out text will appear. That is intended behavior
            if (option.checked) {
              claimedString.push(option.key);
            }
          });
          return claimedString.join(', ');
        },
      });
      /**
       * there are other input types for extra data besides address
       * that are not used on the old backend, but could be added here
       */
      question.options
        ?.filter((option) => option.collectAddress)
        .forEach((option) => {
          headers.push({
            path: `${applicationSection}.${question.id}.${option.text.replace(
              '.',
              '',
            )}.address`,
            label: `${labelString} ${question.text} - ${option.text} - Address`,
            format: (val: ApplicationMultiselectQuestion): string => {
              return multiselectQuestionFormat(val, option.text, 'address');
            },
          });
          if (option.validationMethod) {
            headers.push({
              path: `${applicationSection}.${question.id}.${option.text.replace(
                '.',
                '',
              )}.geocodingVerified`,
              label: `${labelString} ${question.text} - ${option.text} - Passed Address Check`,
              format: (val: ApplicationMultiselectQuestion): string => {
                return multiselectQuestionFormat(
                  val,
                  option.text,
                  'geocodingVerified',
                );
              },
            });
          }
          if (option.collectName) {
            headers.push({
              path: `${applicationSection}.${question.id}.${option.text.replace(
                '.',
                '',
              )}.addressHolderName`,
              label: `${labelString} ${question.text} - ${option.text} - Name of Address Holder`,
              format: (val: ApplicationMultiselectQuestion): string => {
                return multiselectQuestionFormat(
                  val,
                  option.text,
                  'addressHolderName',
                );
              },
            });
          }
          if (option.collectRelationship) {
            headers.push({
              path: `${applicationSection}.${question.id}.${option.text.replace(
                '.',
                '',
              )}.addressHolderRelationship`,
              label: `${labelString} ${question.text} - ${option.text} - Relationship to Address Holder`,
              format: (val: ApplicationMultiselectQuestion): string => {
                return multiselectQuestionFormat(
                  val,
                  option.text,
                  'addressHolderRelationship',
                );
              },
            });
          }
        });
    });

  return headers;
};

/**
 *
 * @param question the multiselect question to format
 * @param optionText the option to consider selected
 * @param key additional formatting (address or geocodingVerified)
 * @returns the string representation of the multiselect format
 */
export const multiselectQuestionFormat = (
  question: ApplicationMultiselectQuestion,
  optionText: string,
  key: string,
): string => {
  if (!question) return '';
  const selectedOption = question.options.find(
    (option) => option.key === optionText,
  );
  const extraData = selectedOption?.extraData?.find((data) => data.key === key);
  if (!extraData) {
    return '';
  }
  if (key === 'address') {
    return addressToString(extraData.value as Address);
  }
  if (key === 'geocodingVerified') {
    return extraData.value === 'unknown'
      ? 'Needs Manual Verification'
      : extraData.value.toString();
  }
  return extraData.value as string;
};

/**
 *
 * @param address the address to convert to a string
 * @returns a string representation of the address
 */
export const addressToString = (address: Address): string => {
  return `${address.street}${address.street2 ? ' ' + address.street2 : ''} ${
    address.city
  }, ${address.state} ${address.zipCode}`;
};

/**
 *
 * @param maxHouseholdMembers the maximum number of household members across all applications
 * @returns the headers and formatters for the household member columns
 */
export const getHouseholdCsvHeaders = (
  maxHouseholdMembers: number,
): CsvHeader[] => {
  const headers = [];
  for (let i = 0; i < maxHouseholdMembers; i++) {
    const j = i + 1;
    headers.push(
      {
        path: `householdMember.${i}.firstName`,
        label: `Household Member (${j}) First Name`,
      },
      {
        path: `householdMember.${i}.middleName`,
        label: `Household Member (${j}) Middle Name`,
      },
      {
        path: `householdMember.${i}.lastName`,
        label: `Household Member (${j}) Last Name`,
      },
      {
        path: `householdMember.${i}.firstName`,
        label: `Household Member (${j}) First Name`,
      },
      {
        path: `householdMember.${i}.birthDay`,
        label: `Household Member (${j}) Birth Day`,
      },
      {
        path: `householdMember.${i}.birthMonth`,
        label: `Household Member (${j}) Birth Month`,
      },
      {
        path: `householdMember.${i}.birthYear`,
        label: `Household Member (${j}) Birth Year`,
      },
      {
        path: `householdMember.${i}.sameAddress`,
        label: `Household Member (${j}) Same as Primary Applicant`,
      },
      {
        path: `householdMember.${i}.relationship`,
        label: `Household Member (${j}) Relationship`,
      },
      {
        path: `householdMember.${i}.householdMemberAddress.street`,
        label: `Household Member (${j}) Street`,
      },
      {
        path: `householdMember.${i}.householdMemberAddress.street2`,
        label: `Household Member (${j}) Street 2`,
      },
      {
        path: `householdMember.${i}.householdMemberAddress.city`,
        label: `Household Member (${j}) City`,
      },
      {
        path: `householdMember.${i}.householdMemberAddress.state`,
        label: `Household Member (${j}) State`,
      },
      {
        path: `householdMember.${i}.householdMemberAddress.zipCode`,
        label: `Household Member (${j}) Zip Code`,
      },
    );
  }

  return headers;
};

/**
 *
 * @param type takes in the demographic string
 * @returns outputs the readable version of the string
 */
export const convertDemographicRaceToReadable = (type: string): string => {
  const [rootKey, customValue = ''] = type.split(':');
  //only show colon if user entered a custom value
  const customValueFormatted = customValue ? `:${customValue}` : '';
  const typeMap = {
    asian: 'Asian',
    'asian-chinese': 'Asian[Chinese]',
    'asian-filipino': 'Asian[Filipino]',
    'asian-japanese': 'Asian[Japanese]',
    'asian-korean': 'Asian[Korean]',
    'asian-mongolian': 'Asian[Mongolian]',
    'asian-vietnamese': 'Asian[Vietnamese]',
    'asian-centralAsian': 'Asian[Central Asian]',
    'asian-southAsian': 'Asian[South Asian]',
    'asian-southeastAsian': 'Asian[Southeast Asian]',
    'asian-otherAsian': `Asian[Other Asian${customValueFormatted}]`,
    black: 'Black',
    'black-african': 'Black[African]',
    'black-africanAmerican': 'Black[African American]',
    'black-caribbeanCentralSouthAmericanMexican':
      'Black[Caribbean, Central American, South American or Mexican]',
    'black-otherBlack': `Black[Other Black${customValueFormatted}]`,
    indigenous: 'Indigenous',
    'indigenous-alaskanNative': 'Indigenous[Alaskan Native]',
    'indigenous-nativeAmerican': 'Indigenous[American Indian/Native American]',
    'indigenous-indigenousFromMexicoCaribbeanCentralSouthAmerica':
      'Indigenous[Indigenous from Mexico, the Caribbean, Central America, or South America]',
    'indigenous-otherIndigenous': `Indigenous[Other Indigenous${customValueFormatted}]`,
    latino: 'Latino',
    'latino-caribbean': 'Latino[Caribbean]',
    'latino-centralAmerican': 'Latino[Central American]',
    'latino-mexican': 'Latino[Mexican]',
    'latino-southAmerican': 'Latino[South American]',
    'latino-otherLatino': `Latino[Other Latino${customValueFormatted}]`,
    middleEasternOrAfrican: 'Middle Eastern, West African or North African',
    'middleEasternOrAfrican-northAfrican':
      'Middle Eastern, West African or North African[North African]',
    'middleEasternOrAfrican-westAsian':
      'Middle Eastern, West African or North African[West Asian]',
    'middleEasternOrAfrican-otherMiddleEasternNorthAfrican': `Middle Eastern, West African or North African[Other Middle Eastern or North African${customValueFormatted}]`,
    pacificIslander: 'Pacific Islander',
    'pacificIslander-chamorro': 'Pacific Islander[Chamorro]',
    'pacificIslander-nativeHawaiian': 'Pacific Islander[Native Hawaiian]',
    'pacificIslander-samoan': 'Pacific Islander[Samoan]',
    'pacificIslander-otherPacificIslander': `Pacific Islander[Other Pacific Islander${customValueFormatted}]`,
    white: 'White',
    'white-european': 'White[European]',
    'white-otherWhite': `White[Other White${customValueFormatted}]`,
  };
  return typeMap[rootKey] ?? rootKey;
};

/**
 *
 * @param type takes in the demographic string
 * @returns outputs the readable version of the string
 */
export const convertDemographicGenderToReadable = (type: string): string => {
  const typeMap = {
    'genderqueerGenderNon-Binary': 'Genderqueer / Gender Nonbinary',
    transMale: 'Trans Man / Transmasculine / Trans Male',
    transFemale: 'Trans Woman / Transfeminine / Trans Female',
    male: 'Man',
    female: 'Woman',
    differentTerm: 'I use a different term',
    dontKnow: 'I don’t know or don’t understand the question',
    preferNoResponse: 'Prefer not to respond',
  };
  return typeMap[type] ?? type;
};

/**
 *
 * @param type takes in the demographic string
 * @returns outputs the readable version of the string
 */
export const convertDemographicSexualOrientationToReadable = (
  type: string,
): string => {
  const typeMap = {
    asexual: 'Asexual',
    bisexual: 'Bisexual',
    gayLesbianSameGenderLoving: 'Gay / Lesbian / Same-Gender Loving',
    questioningUnsure: 'Questioning / Unsure',
    straightHeterosexual: 'Straight / Heterosexual',
    differentTerm: 'I use a different term',
    dontKnow: 'I don’t understand the question',
    preferNoResponse: 'Prefer not to respond',
  };
  return typeMap[type] ?? type;
};

/**
 *
 * @param type takes in the demographic string
 * @returns outputs the readable version of the string
 */
export const convertDemographicLanguageToReadable = (type: string): string => {
  const [rootKey, customValue = ''] = type.split(':');
  const typeMap = {
    chineseCantonese: 'Chinese - Cantonese',
    chineseMandarin: 'Chinese - Mandarin',
    english: 'English',
    filipino: 'Filipino',
    korean: 'Korean',
    russian: 'Russian',
    spanish: 'Spanish',
    vietnamese: 'Vietnamese',
    notListed: `Not Listed:${customValue}`,
  };
  return typeMap[rootKey] ?? rootKey;
};

/**
 *
 * @param type takes in the demographic string
 * @returns outputs the readable version of the string
 */
export const convertDemographicHowDidYouHearToReadable = (
  type: string,
): string => {
  const typeMap = {
    governmentWebsite: 'Government Website',
    propertyWebsite: 'Property Website',
    emailAlert: 'Email Alert',
    friend: 'Friend',
    housingCounselor: 'Housing Counselor',
    flyer: 'Flyer',
    radioAd: 'Radio Ad',
    busAd: 'Bus Ad',
    other: 'Other',
  };
  return typeMap[type] ?? type;
};

export const typeMap = {
  SRO: 'SRO',
  studio: 'Studio',
  oneBdrm: 'One Bedroom',
  twoBdrm: 'Two Bedroom',
  threeBdrm: 'Three Bedroom',
  fourBdrm: 'Four+ Bedroom',
  fiveBdrm: 'Five Bedroom',
};

/**
 * @param type the unit type we are converting from type to string
 * @returns the string representation of that unit type
 */
export const unitTypeToReadable = (type: string): string => {
  return typeMap[type] ?? type;
};
