import { Injectable, BadRequestException } from '@nestjs/common';
import {
  ApplicationMethodsTypeEnum,
  LanguagesEnum,
  MultiselectQuestionsApplicationSectionEnum,
  Prisma,
  PrismaClient,
  ReviewOrderTypeEnum,
} from '@prisma/client';
import { Request as ExpressRequest } from 'express';
import { AmiChartService } from './ami-chart.service';
import { FeatureFlagService } from './feature-flag.service';
import { PrismaService } from './prisma.service';
import { SuccessDTO } from '../dtos/shared/success.dto';
import { User } from '../dtos/users/user.dto';
import { mapTo } from '../utilities/mapTo';
import { DataTransferDTO } from '../dtos/script-runner/data-transfer.dto';
import { AmiChartImportDTO } from '../dtos/script-runner/ami-chart-import.dto';
import { AmiChartCreate } from '../dtos/ami-charts/ami-chart-create.dto';
import { AmiChartUpdate } from '../dtos/ami-charts/ami-chart-update.dto';
import { AmiChartUpdateImportDTO } from '../dtos/script-runner/ami-chart-update-import.dto';
import { HouseholdMemberRelationship } from '../../src/enums/applications/household-member-relationship-enum';

/**
  this is the service for running scripts
  most functions in here will be unique, but each function should only be allowed to fire once
*/
@Injectable()
export class ScriptRunnerService {
  constructor(
    private amiChartService: AmiChartService,
    private featureFlagService: FeatureFlagService,
    private prisma: PrismaService,
  ) {}

  /**
   *
   * @param req incoming request object
   * @param dataTransferDTO data transfer endpoint args. Should contain foreign db connection string
   * @returns successDTO
   * @description transfers data from foreign data into the database this api normally connects to
   */
  async transferJurisdictionData(
    req: ExpressRequest,
    dataTransferDTO: DataTransferDTO,
    prisma?: PrismaClient,
  ): Promise<SuccessDTO> {
    // script runner standard start up
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart(
      `data transfer ${dataTransferDTO.jurisdiction}`,
      requestingUser,
    );

    // connect to foreign db based on incoming connection string
    const client =
      prisma ||
      new PrismaClient({
        datasources: {
          db: {
            url: dataTransferDTO.connectionString,
          },
        },
      });
    await client.$connect();

    const doorwayJurisdiction = await this.prisma.jurisdictions.findFirst({
      where: { name: dataTransferDTO.jurisdiction },
    });

    if (!doorwayJurisdiction) {
      throw new Error(
        `${dataTransferDTO.jurisdiction} county doesn't exist in Doorway database`,
      );
    }

    // get jurisdiction
    const jurisdiction: { id: string }[] =
      await client.$queryRaw`SELECT id, name FROM jurisdictions WHERE name = ${dataTransferDTO.jurisdiction}`;

    if (!jurisdiction?.length) {
      throw new Error(
        `${dataTransferDTO.jurisdiction} county doesn't exist in foreign database`,
      );
    }

    // get ami charts
    const amiQuery = `SELECT items, name, id FROM ami_chart WHERE jurisdiction_id = '${jurisdiction[0].id}'`;
    const amiCharts: { items: any; name: string }[] =
      await client.$queryRawUnsafe(amiQuery);

    // save ami charts
    if (amiCharts?.length) {
      console.log(`migrating ${amiCharts.length} ami charts`);
      await this.prisma.amiChart.createMany({
        data: amiCharts.map((data) => {
          return { ...data, jurisdictionId: doorwayJurisdiction.id };
        }),
      });
    }

    // get multiselect questions
    const multiselectQuery = `SELECT mq.id, mq.text, mq.sub_text, mq.description, mq.links, mq.options, mq.opt_out_text, mq.hide_from_listing, mq.application_section
    FROM multiselect_questions mq, "_JurisdictionsToMultiselectQuestions" jmq
    WHERE jmq."A" = '${jurisdiction[0].id}'
    AND jmq."B" = mq.id`;
    const multiselectQuestions: {
      id: string;
      text: string;
      sub_text: string;
      description: string;
      links: string;
      options: string;
      hide_from_listing: boolean;
      application_section: MultiselectQuestionsApplicationSectionEnum;
      opt_out_text: string;
    }[] = await client.$queryRawUnsafe(multiselectQuery);

    // save multiselect questions
    if (multiselectQuestions?.length) {
      console.log(
        `migrating ${multiselectQuestions.length} multiselect questions`,
      );
      multiselectQuestions.forEach(async (question) => {
        await this.prisma.multiselectQuestions.create({
          data: {
            id: question.id,
            text: question.text,
            subText: question.sub_text,
            description: question.description,
            hideFromListing: question.hide_from_listing,
            applicationSection: question.application_section,
            links: question.links,
            options: question.options,
            optOutText: question.opt_out_text,
            jurisdictions: {
              connect: {
                id: doorwayJurisdiction.id,
              },
            },
          },
        });
      });
    }

    // disconnect from foreign db
    await client.$disconnect();

    // script runner standard spin down
    await this.markScriptAsComplete(
      `data transfer ${dataTransferDTO.jurisdiction}`,
      requestingUser,
    );
    return { success: true };
  }

  createAddress(dbAddress, jurisdictionName?: string) {
    return {
      createdAt: dbAddress[0]['created_at'],
      placeName: dbAddress[0]['place_name'],
      city: dbAddress[0]['city'],
      county: dbAddress[0]['county'] || jurisdictionName,
      state: dbAddress[0]['state'],
      street: dbAddress[0]['street'],
      street2: dbAddress[0]['street2'],
      zipCode: dbAddress[0]['zip_code'],
      latitude: dbAddress[0]['latitude'],
      longitude: dbAddress[0]['longitude'],
    };
  }

  /**
   *
   * @param req incoming request object
   * @param dataTransferDTO data transfer endpoint args. Should contain foreign db connection string
   * @returns successDTO
   * @description transfers data from foreign data into the database this api normally connects to
   */
  async transferJurisdictionListingData(
    req: ExpressRequest,
    dataTransferDTO: DataTransferDTO,
    prisma?: PrismaClient,
  ): Promise<SuccessDTO> {
    // script runner standard start up
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart(
      `data transfer listings ${dataTransferDTO.jurisdiction}`,
      requestingUser,
    );

    // connect to foreign db based on incoming connection string
    const client =
      prisma ||
      new PrismaClient({
        datasources: {
          db: {
            url: dataTransferDTO.connectionString,
          },
        },
      });
    await client.$connect();

    const doorwayJurisdiction = await this.prisma.jurisdictions.findFirst({
      where: { name: dataTransferDTO.jurisdiction },
    });

    if (!doorwayJurisdiction) {
      throw new Error(
        `${dataTransferDTO.jurisdiction} county doesn't exist in Doorway database`,
      );
    }

    // get jurisdiction
    const jurisdiction: { id: string }[] =
      await client.$queryRaw`SELECT id, name FROM jurisdictions WHERE name = ${dataTransferDTO.jurisdiction}`;

    if (!jurisdiction) {
      throw new Error(
        `${dataTransferDTO.jurisdiction} county doesn't exist in foreign database`,
      );
    }

    const listingQuery = `SELECT * FROM listings WHERE jurisdiction_id = '${jurisdiction[0].id}'`;
    const listings: any[] = await client.$queryRawUnsafe(listingQuery);

    if (listings?.length) {
      const priorityTypes: { id: string; name: string }[] =
        await client.$queryRaw`SELECT * FROM unit_accessibility_priority_types`;
      const doorwayPriorityTypes =
        await this.prisma.unitAccessibilityPriorityTypes.findMany();
      const rentTypes: { id: string; name: string }[] =
        await client.$queryRaw`SELECT * FROM unit_types`;
      const doorwayRentTypes = await this.prisma.unitRentTypes.findMany();
      console.log(`migrating ${listings.length} listings`);
      for (const listing of listings) {
        console.log(`migrating ${listing['name']} listing`);

        let buildingAddress;
        if (listing['building_address_id']) {
          buildingAddress = await client.$queryRawUnsafe(
            `SELECT * FROM address WHERE id = '${listing['building_address_id']}'`,
          );
        }
        let leasingAgentAddress;
        if (listing['leasing_agent_address_id']) {
          leasingAgentAddress = await client.$queryRawUnsafe(
            `SELECT * FROM address WHERE id = '${listing['leasing_agent_address_id']}'`,
          );
        }
        let applicationPickUpAddress;
        if (listing['application_pick_up_address_id']) {
          applicationPickUpAddress = await client.$queryRawUnsafe(
            `SELECT * FROM address WHERE id = '${listing['application_pick_up_address_id']}'`,
          );
        }
        let applicationDropOffAddress;
        if (listing['application_drop_off_address_id']) {
          applicationDropOffAddress = await client.$queryRawUnsafe(
            `SELECT * FROM address WHERE id = '${listing['application_drop_off_address_id']}'`,
          );
        }
        let applicationMailingAddress;
        if (listing['application_mailing_address_id']) {
          applicationMailingAddress = await client.$queryRawUnsafe(
            `SELECT * FROM address WHERE id = '${listing['application_mailing_address_id']}'`,
          );
        }
        let reservedCommunityType;
        if (listing['reserved_community_type_id']) {
          reservedCommunityType = await client.$queryRawUnsafe(
            `SELECT * FROM reserved_community_types WHERE id = '${listing['reserved_community_type_id']}'`,
          );
          if (reservedCommunityType.length) {
            const reservedCommunityTypes =
              await this.prisma.reservedCommunityTypes.findMany();
            const name = reservedCommunityType[0]['name'];
            const foundReservedCommunityType = reservedCommunityTypes.find(
              (communityType) =>
                communityType.name === name ||
                (name === 'senior' && communityType.name === 'senior55'),
            );
            if (foundReservedCommunityType) {
              reservedCommunityType = foundReservedCommunityType;
            }
          }
        }
        const applicationMethods: {
          type: string;
          label: string;
          external_reference: string;
          accepts_postmarked_applications: boolean;
          phone_number: string;
        }[] = await client.$queryRawUnsafe(
          `SELECT * FROM application_methods WHERE listing_id = '${listing['id']}'`,
        );

        const createdListing = await this.prisma.listings.create({
          data: {
            id: listing['id'],
            listingsBuildingAddress: buildingAddress?.length
              ? {
                  create: this.createAddress(
                    buildingAddress,
                    dataTransferDTO.jurisdiction,
                  ),
                }
              : undefined,
            listingsLeasingAgentAddress: leasingAgentAddress?.length
              ? {
                  create: this.createAddress(leasingAgentAddress),
                }
              : undefined,
            listingsApplicationPickUpAddress: applicationPickUpAddress?.length
              ? { create: this.createAddress(applicationPickUpAddress) }
              : undefined,
            listingsApplicationDropOffAddress: applicationDropOffAddress?.length
              ? { create: this.createAddress(applicationDropOffAddress) }
              : undefined,
            listingsApplicationMailingAddress: applicationMailingAddress?.length
              ? { create: this.createAddress(applicationMailingAddress) }
              : undefined,
            jurisdictions: {
              connect: {
                id: doorwayJurisdiction.id,
              },
            },
            reservedCommunityTypes: reservedCommunityType?.id
              ? {
                  connect: {
                    id: reservedCommunityType.id,
                  },
                }
              : undefined,
            applicationMethods: applicationMethods?.length
              ? {
                  createMany: {
                    data: applicationMethods.map((method) => {
                      return {
                        type: method.type as ApplicationMethodsTypeEnum,
                        label: method.label,
                        acceptsPostmarkedApplications:
                          method.accepts_postmarked_applications,
                        phoneNumber: method.phone_number,
                      };
                    }),
                  },
                }
              : undefined,
            createdAt: listing['created_at'],
            additionalApplicationSubmissionNotes:
              listing['additional_application_submission_notes'],
            digitalApplication: listing['digital_application'],
            commonDigitalApplication: listing['common_digital_application'],
            paperApplication: listing['paper_application'],
            referralOpportunity: listing['referral_opportunity'],
            assets: listing['assets'],
            accessibility: listing['accessibility'],
            amenities: listing['amenities'],
            buildingTotalUnits: listing['building_total_units'],
            developer: listing['developer'],
            householdSizeMax: listing['household_size_max'],
            householdSizeMin: listing['household_size_min'],
            neighborhood: listing['neighborhood'],
            petPolicy: listing['pet_policy'],
            smokingPolicy: listing['smoking_policy'],
            unitsAvailable: listing['units_available'],
            unitAmenities: listing['unit_amenities'],
            servicesOffered: listing['services_offered'],
            yearBuilt: listing['year_built'],
            applicationDueDate: listing['application_due_date'],
            applicationOpenDate: listing['application_open_date'],
            applicationFee: listing['application_fee'],
            applicationOrganization: listing['application_organization'],
            applicationPickUpAddressOfficeHours:
              listing['application_pick_up_address_office_hours'],
            applicationDropOffAddressOfficeHours:
              listing['application_drop_off_address_office_hours'],
            buildingSelectionCriteria: listing['building_selection_criteria'],
            costsNotIncluded: listing['costs_not_included'],
            creditHistory: listing['credit_history'],
            criminalBackground: listing['criminal_background'],
            depositMin: listing['deposit_min'],
            depositMax: listing['deposit_max'],
            depositHelperText: listing['deposit_helper_text'],
            disableUnitsAccordion: listing['disable_units_accordion'],
            leasingAgentEmail: listing['leasing_agent_email'],
            leasingAgentName: listing['leasing_agent_name'],
            leasingAgentOfficeHours: listing['leasing_agent_office_hours'],
            leasingAgentPhone: listing['leasing_agent_phone'],
            leasingAgentTitle: listing['leasing_agent_title'],
            name: listing['name'],
            postmarkedApplicationsReceivedByDate:
              listing['postmarked_applications_received_by_date'],
            programRules: listing['program_rules'],
            rentalAssistance: listing['rental_assistance'],
            rentalHistory: listing['rental_history'],
            requiredDocuments: listing['required_documents'],
            specialNotes: listing['special_notes'],
            waitlistCurrentSize: listing['waitlist_current_size'],
            waitlistMaxSize: listing['waitlist_current_size'],
            whatToExpect: listing['what_to_expect'],
            status: listing['status'],
            reviewOrderType: listing['review_order_type'],
            displayWaitlistSize: listing['display_waitlist_size'],
            reservedCommunityDescription:
              listing['reserved_community_description'],
            reservedCommunityMinAge: listing['reserved_community_min_age'],
            resultLink: listing['result_link'],
            isWaitlistOpen: listing['is_waitlist_open'],
            waitlistOpenSpots: listing['waitlist_open_spots'],
            customMapPin: listing['custom_map_pin'],
            publishedAt: listing['published_at'],
            closedAt: listing['closed_at'],
            // afs last run needs to be now so the afs job isn't triggered by the applications ported over in the next script
            afsLastRunAt: new Date(),
            lastApplicationUpdateAt: listing['last_application_update_at'],
            requestedChanges: listing['requested_changes'],
            requestedChangesDate: listing['requested_changes_date'],
            // NOTE: add requested changes user ID not be carried over
            amiPercentageMax: listing['ami_percentage_max'],
            amiPercentageMin: listing['ami_percentage_min'],
            homeType: listing['home_type'],
            hrdId: listing['hrd_id'],
            isVerified: listing['is_verified'],
            managementCompany: listing['management_company'],
            managementWebsite: listing['management_website'],
            marketingType: listing['marketing_type'],
            ownerCompany: listing['owner_company'],
            phoneNumber: listing['phone_number'],
            applicationPickUpAddressType:
              listing['application_pick_up_address_type'],
            applicationDropOffAddressType:
              listing['application_drop_off_address_type'],
            applicationMailingAddressType:
              listing['application_mailing_address_type'],
            contentUpdatedAt: listing['content_updated_at'],
          },
        });

        // upload units
        const units: any[] = await client.$queryRawUnsafe(
          `SELECT u.*, ut.name FROM units u, unit_types ut WHERE ut.id = u.unit_type_id AND u.listing_id = '${listing['id']}'`,
        );
        for (const unit of units) {
          let doorwayAmiChart;
          let unitType;
          let priorityType: { id: string; name: string };
          let rentType;
          // We need to get the amiChart from Doorway because it might not have been carried over from HBA
          // Example: the ami chart in HBA is tied to the wrong jurisdiction
          if (unit['ami_chart_id']) {
            doorwayAmiChart = await this.prisma.amiChart.findFirst({
              where: { id: unit['ami_chart_id'] },
            });
            if (!doorwayAmiChart) {
              // logging any missed ami chart so we can manually consolidate it later
              console.log(
                `Ami chart not found in Doorway: ${unit['ami_chart_id']} for listing ${listing['name']}`,
              );
            }
          }
          if (unit['name']) {
            unitType = await this.prisma.unitTypes.findFirst({
              select: {
                id: true,
              },
              where: {
                name: unit['name'],
              },
            });
          }
          if (unit['priority_type_id']) {
            const fullPriorityType = priorityTypes.find(
              (type) => type.id === unit['priority_type_id'],
            );
            priorityType = doorwayPriorityTypes.find(
              (type) => type.name === fullPriorityType.name,
            );
            if (!priorityType) {
              // Log any priority types that aren't in Doorway so we can manually add later
              console.log(
                `Priority type not found in Doorway: "${fullPriorityType?.name}" for listing ${listing['name']}`,
              );
            }
          }
          if (unit['unit_rent_type_id']) {
            const fullRentType = rentTypes.find(
              (type) => type.id === unit['unit_rent_type_id'],
            );
            rentType = doorwayRentTypes.find(
              (type) => type.name === fullRentType.name,
            );
          }

          await this.prisma.units.create({
            data: {
              listings: {
                connect: {
                  id: createdListing.id,
                },
              },
              amiChart: doorwayAmiChart
                ? {
                    connect: {
                      id: doorwayAmiChart.id,
                    },
                  }
                : undefined,
              unitTypes: unitType
                ? {
                    connect: {
                      id: unitType.id,
                    },
                  }
                : undefined,
              unitAccessibilityPriorityTypes: priorityType
                ? { connect: { id: priorityType.id } }
                : undefined,
              unitRentTypes: rentType
                ? { connect: { id: rentType.id } }
                : undefined,
              amiPercentage: unit['ami_percentage'],
              annualIncomeMin: unit['annual_income_min'],
              annualIncomeMax: unit['annual_income_max'],
              floor: unit['floor'],
              monthlyIncomeMin: unit['monthly_income_min'],
              maxOccupancy: unit['max_occupancy'],
              minOccupancy: unit['min_occupancy'],
              monthlyRent: unit['monthly_rent'],
              numBathrooms: unit['num_bathrooms'],
              numBedrooms: unit['num_bedrooms'],
              number: unit['number'],
              sqFeet: unit['sq_feet'],
              monthlyRentAsPercentOfIncome:
                unit['monthly_rent_as_percent_of_income'],
              bmrProgramChart: unit['bmr_program_chart'],
              status: unit['status'],
            },
          });
        }

        // Migrate the listing to multiselect question mapping
        const listingMultiselectQuestions: {
          ordinal: number;
          listing_id: string;
          multiselect_question_id: string;
        }[] = await client.$queryRawUnsafe(
          `SELECT * FROM listing_multiselect_questions WHERE listing_id = '${listing['id']}'`,
        );
        if (listingMultiselectQuestions?.length) {
          console.log(
            `migrating ${listingMultiselectQuestions.length} listing multiselect questions`,
          );
          listingMultiselectQuestions.forEach(async (lmq) => {
            try {
              await this.prisma.listingMultiselectQuestions.create({
                data: {
                  ordinal: lmq.ordinal,
                  listingId: createdListing.id,
                  multiselectQuestionId: lmq.multiselect_question_id,
                },
              });
            } catch (e) {
              // Log the failed ones so we can manually add them later if need be
              console.log(
                `unable to migrate listing multiselect question ${lmq.multiselect_question_id} to listing ${createdListing.id}`,
              );
            }
          });
        }

        // Migrate all events that don't have a file associated to it
        const listingEvents: any[] = await client.$queryRawUnsafe(
          `SELECT * FROM listing_events WHERE listing_id = '${listing['id']}' AND file_id IS NULL`,
        );
        if (listingEvents?.length) {
          console.log(`migrating ${listingEvents.length} listing events`);
          await this.prisma.listingEvents.createMany({
            data: listingEvents.map((event) => {
              return {
                type: event['type'],
                url: event['url'],
                listingId: createdListing.id,
                note: event['note'],
                label: event['label'],
                startTime: event['start_time'],
                endTime: event['end_time'],
                startDate: event['start_date'],
              };
            }),
          });
        }
      }
    }

    // disconnect from foreign db
    await client.$disconnect();

    // script runner standard spin down
    await this.markScriptAsComplete(
      `data transfer listings ${dataTransferDTO.jurisdiction}`,
      requestingUser,
    );
    return { success: true };
  }

  /**
   *
   * @param req incoming request object
   * @param dataTransferDTO data transfer endpoint args. Should contain foreign db connection string
   * @returns successDTO
   * @description transfers partner users from foreign data into the database this api normally connects to
   */
  async transferJurisdictionPartnerUserData(
    req: ExpressRequest,
    dataTransferDTO: DataTransferDTO,
    prisma?: PrismaClient,
  ): Promise<SuccessDTO> {
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart(
      `data transfer user and application ${dataTransferDTO.jurisdiction}`,
      requestingUser,
    );

    // connect to foreign db based on incoming connection string
    const client =
      prisma ||
      new PrismaClient({
        datasources: {
          db: {
            url: dataTransferDTO.connectionString,
          },
        },
      });
    await client.$connect();

    const doorwayJurisdiction = await this.prisma.jurisdictions.findFirst({
      where: { name: dataTransferDTO.jurisdiction },
    });

    if (!doorwayJurisdiction) {
      throw new Error(
        `${dataTransferDTO.jurisdiction} county doesn't exist in Doorway database`,
      );
    }

    // get jurisdiction
    const jurisdiction: { id: string }[] =
      await client.$queryRaw`SELECT id, name FROM jurisdictions WHERE name = ${dataTransferDTO.jurisdiction}`;

    if (!jurisdiction) {
      throw new Error(
        `${dataTransferDTO.jurisdiction} county doesn't exist in foreign database`,
      );
    }

    const partnerUsers = await client.userAccounts.findMany({
      include: {
        listings: {
          select: { id: true, jurisdictionId: true },
        },
      },
      where: {
        userRoles: {
          isPartner: true,
        },
        jurisdictions: {
          some: { id: jurisdiction[0].id },
        },
      },
    });

    if (partnerUsers?.length) {
      console.log(`migrating ${partnerUsers.length} partner users`);
      for (const partner of partnerUsers) {
        const listings = partner.listings
          ? partner.listings
              .filter(
                (listing) => listing.jurisdictionId === jurisdiction[0].id,
              )
              .map((listing) => {
                return { id: listing.id };
              })
          : undefined;
        try {
          await this.prisma.userAccounts.create({
            data: {
              ...partner,
              updatedAt: undefined, // updated at should be the date it's imported to doorway
              agreedToTermsOfService: false, // Users will need to agree to terms again as they differ in Doorway
              listings: partner.listings
                ? {
                    connect: partner.listings
                      .filter(
                        (listing) =>
                          listing.jurisdictionId === jurisdiction[0].id,
                      )
                      .map((listing) => {
                        return { id: listing.id };
                      }),
                  }
                : undefined,
              userRoles: {
                create: { isPartner: true },
              },
              jurisdictions: {
                connect: {
                  id: doorwayJurisdiction.id,
                },
              },
            },
          });
        } catch (e) {
          console.log(
            `unable to migrate partner user ${
              partner.email
            } for listings ${listings
              ?.map((listing) => listing.id)
              .toLocaleString()}`,
          );
          console.log(e);
        }
      }
    }

    // disconnect from foreign db
    await client.$disconnect();

    // script runner standard spin down
    await this.markScriptAsComplete(
      `data transfer user and application ${dataTransferDTO.jurisdiction}`,
      requestingUser,
    );

    return { success: true };
  }

  /**
   *
   * @param req incoming request object
   * @param dataTransferDTO data transfer endpoint args. Should contain foreign db connection string
   * @returns successDTO
   * @description transfers public users and corresponding applications from foreign data into the database this api normally connects to
   */
  async transferJurisdictionPublicUserAndApplicationData(
    req: ExpressRequest,
    dataTransferDTO: DataTransferDTO,
    prisma?: PrismaClient,
  ): Promise<SuccessDTO> {
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart(
      `data transfer public users and applications ${dataTransferDTO.jurisdiction}`,
      requestingUser,
    );

    // connect to foreign db based on incoming connection string
    const client =
      prisma ||
      new PrismaClient({
        datasources: {
          db: {
            url: dataTransferDTO.connectionString,
          },
        },
      });
    await client.$connect();

    const doorwayJurisdiction = await this.prisma.jurisdictions.findFirst({
      where: { name: dataTransferDTO.jurisdiction },
    });

    if (!doorwayJurisdiction) {
      throw new Error(
        `${dataTransferDTO.jurisdiction} county doesn't exist in Doorway database`,
      );
    }

    // get jurisdiction
    const jurisdiction: { id: string }[] =
      await client.$queryRaw`SELECT id, name FROM jurisdictions WHERE name = ${dataTransferDTO.jurisdiction}`;

    if (!jurisdiction) {
      throw new Error(
        `${dataTransferDTO.jurisdiction} county doesn't exist in foreign database`,
      );
    }

    const publicUsers = await client.userAccounts.findMany({
      include: {
        applications: {
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
            appUrl: true,
            householdSize: true,
            submissionType: true,
            acceptedTerms: true,
            submissionDate: true,
            markedAsDuplicate: true,
            confirmationCode: true,
            reviewStatus: true,
            status: true,
            language: true,
            listings: {
              select: {
                id: true,
                jurisdictionId: true,
              },
            },
            householdMember: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      where: {
        jurisdictions: {
          some: { id: jurisdiction[0].id },
        },
        userRoles: null,
        applications: { some: {} },
      },
    });

    if (publicUsers?.length) {
      console.log(`migrating ${publicUsers.length} public users`);
      let totalApplications = 0,
        currentUserCount = 0;
      for (const publicUser of publicUsers) {
        let user = await this.prisma.userAccounts.findFirst({
          where: { email: publicUser.email },
        });
        if (!user) {
          user = await this.prisma.userAccounts.create({
            data: {
              ...publicUser,
              updatedAt: undefined, // updated at should be the date it's imported to doorway
              agreedToTermsOfService: false, // Users will need to agree to terms again as they differ in Doorway
              jurisdictions: {
                connect: {
                  id: doorwayJurisdiction.id,
                },
              },
              applications: undefined,
            },
          });
        } else {
          console.log(
            `a user with email ${user.email} already exists in the system`,
          );
        }
        for (const application of publicUser.applications) {
          // Only migrate applications for this jurisdiction
          if (application.listings.jurisdictionId === jurisdiction[0].id) {
            try {
              await this.prisma.applications.create({
                data: {
                  id: application.id,
                  createdAt: application.createdAt,
                  updatedAt: application.updatedAt,
                  deletedAt: application.deletedAt,
                  confirmationCode: application.confirmationCode,
                  submissionType: application.submissionType,
                  submissionDate: application.submissionDate,
                  preferences: [],
                  programs: [],
                  contactPreferences: [],
                  status: application.status,
                  householdSize: application.householdSize,
                  appUrl: application.appUrl,
                  markedAsDuplicate: application.markedAsDuplicate,
                  reviewStatus: application.reviewStatus,
                  userAccounts: {
                    connect: {
                      // Tie the application to the user, either the new user or the one in our system with the same email
                      id: user.id,
                    },
                  },
                  listings: {
                    connect: {
                      id: application.listings.id,
                    },
                  },
                },
              });
              totalApplications++;
            } catch (e) {
              console.log('e', e);
              console.log(
                `unable to migrate application ${application.id} for user ${user.id}`,
              );
            }
          }
        }
        currentUserCount++;
        // console logs for progress of migration
        if (currentUserCount % 20 === 0) {
          console.log(
            `Progress: ${currentUserCount} users and ${totalApplications} applications`,
          );
        }
      }
      console.log(`migrated ${totalApplications} applications`);
    }

    // disconnect from foreign db
    await client.$disconnect();

    // script runner standard spin down
    await this.markScriptAsComplete(
      `data transfer public users and applications ${dataTransferDTO.jurisdiction}`,
      requestingUser,
    );

    return { success: true };
  }

  /**
   *
   * @param amiChartImportDTO this is a string in a very specific format like:
   * percentOfAmiValue_1 householdSize_1_income_value householdSize_2_income_value \n percentOfAmiValue_2 householdSize_1_income_value householdSize_2_income_value
   * @returns successDTO
   * @description takes the incoming AMI Chart string and stores it as a new AMI Chart in the database
   */
  async amiChartImport(
    req: ExpressRequest,
    amiChartImportDTO: AmiChartImportDTO,
  ): Promise<SuccessDTO> {
    // script runner standard start up
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart(
      `AMI Chart ${amiChartImportDTO.name}`,
      requestingUser,
    );

    // parse incoming string into an amichart create dto
    const createDTO: AmiChartCreate = {
      items: [],
      name: amiChartImportDTO.name,
      jurisdictions: {
        id: amiChartImportDTO.jurisdictionId,
      },
    };

    const rows = amiChartImportDTO.values.split('\n');
    rows.forEach((row: string) => {
      const values = row.split(' ');
      const percentage = values[0];
      values.forEach((value: string, index: number) => {
        if (index > 0) {
          createDTO.items.push({
            percentOfAmi: Number(percentage),
            householdSize: index,
            income: Number(value),
          });
        }
      });
    });

    await this.amiChartService.create(createDTO);

    // script runner standard spin down
    await this.markScriptAsComplete(
      `AMI Chart ${amiChartImportDTO.name}`,
      requestingUser,
    );
    return { success: true };
  }

  /**
   *
   * @param amiChartUpdateImportDTO this is a string in a very specific format like:
   * percentOfAmiValue_1 householdSize_1_income_value householdSize_2_income_value \n percentOfAmiValue_2 householdSize_1_income_value householdSize_2_income_value
   *
   * Copying and pasting from google sheets will not match the format above. You will need to perform the following:
   * 1) Find and delete all instances of "%"
   * 2) Using the Regex option in the Find and Replace tool, replace /\t with " " and /\n with "\\n"
   * See "How to format AMI data for script runner import" in Notion for a more detailed example
   * @returns successDTO
   * @description takes the incoming AMI Chart string and updates existing AMI Chart in the database
   */
  async amiChartUpdateImport(
    req: ExpressRequest,
    amiChartUpdateImportDTO: AmiChartUpdateImportDTO,
  ): Promise<SuccessDTO> {
    // script runner standard start up
    const scriptName = `AMI Chart ${
      amiChartUpdateImportDTO.amiId
    } update ${new Date()}`;
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart(scriptName, requestingUser);

    const ami = await this.amiChartService.findOne(
      amiChartUpdateImportDTO.amiId,
    );

    // parse incoming string into an amichart create dto
    const updateDTO: AmiChartUpdate = {
      id: amiChartUpdateImportDTO.amiId,
      items: [],
      name: ami.name,
    };

    const rows = amiChartUpdateImportDTO.values.split('\n');
    rows.forEach((row: string) => {
      const values = row.split(' ');
      const percentage = values[0];
      values.forEach((value: string, index: number) => {
        if (index > 0) {
          updateDTO.items.push({
            percentOfAmi: Number(percentage),
            householdSize: index,
            income: Number(value),
          });
        }
      });
    });

    await this.amiChartService.update(updateDTO);

    // script runner standard spin down
    await this.markScriptAsComplete(scriptName, requestingUser);
    return { success: true };
  }

  /**
   *
   * @param req incoming request object
   * @param jurisdiction should contain jurisdiction id
   * @returns successDTO
   * @description adds lottery translations to the database
   */
  async addLotteryTranslations(req: ExpressRequest): Promise<SuccessDTO> {
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart('add lottery translations', requestingUser);
    this.addLotteryTranslationsHelper(true);
    await this.markScriptAsComplete('add lottery translations', requestingUser);

    return { success: true };
  }

  /**
   *
   * @param req incoming request object
   * @param jurisdiction should contain jurisdiction id
   * @returns successDTO
   * @description adds lottery translations to the database and create if does not exist
   */
  async addLotteryTranslationsCreateIfEmpty(
    req: ExpressRequest,
  ): Promise<SuccessDTO> {
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart(
      'add lottery translations create if empty',
      requestingUser,
    );
    this.addLotteryTranslationsHelper(true);
    await this.markScriptAsComplete(
      'add lottery translations create if empty',
      requestingUser,
    );

    return { success: true };
  }

  /**
   *
   * @param req incoming request object
   * @returns successDTO
   * @description opts out existing lottery listings
   */
  async optOutExistingLotteries(req: ExpressRequest): Promise<SuccessDTO> {
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart(
      'opt out existing lotteries',
      requestingUser,
    );

    const { count } = await this.prisma.listings.updateMany({
      data: {
        lotteryOptIn: false,
      },
      where: {
        reviewOrderType: ReviewOrderTypeEnum.lottery,
        lotteryOptIn: null,
      },
    });

    console.log(`updated lottery opt in for ${count} listings`);

    await this.markScriptAsComplete(
      'opt out existing lotteries',
      requestingUser,
    );
    return { success: true };
  }

  /**
   *
   * @param req incoming request object
   * @returns successDTO
   * @description add duplicates information to lottery email
   */
  async addDuplicatesInformationToLotteryEmail(
    req: ExpressRequest,
  ): Promise<SuccessDTO> {
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart(
      'add duplicates information to lottery email',
      requestingUser,
    );

    await this.updateTranslationsForLanguage(LanguagesEnum.en, {
      lotteryAvailable: {
        duplicatesDetails:
          'Doorway generally does not accept duplicate applications. A duplicate application is one that has someone who also appears on another application for the same housing opportunity. For more detailed information on how we handle duplicates, see our',
        termsOfUse: 'Terms of Use',
      },
      confirmation: {
        submitAnotherApplication:
          'If you’re not changing the primary applicant or any household members, you can just submit another application.  We’ll take the last one submitted, per the duplicate application policy.',
        otherChanges:
          'For other changes, please contact doorway@bayareametro.gov.',
      },
    });
    await this.updateTranslationsForLanguage(LanguagesEnum.es, {
      lotteryAvailable: {
        duplicatesDetails:
          'Doorway generalmente no acepta solicitudes duplicadas. Una solicitud duplicada es aquella en la que aparece una persona que también aparece en otra solicitud para la misma oportunidad de vivienda. Para obtener información más detallada sobre cómo manejamos las solicitudes duplicadas, consulte nuestros',
        termsOfUse: 'Términos de uso',
      },
      confirmation: {
        submitAnotherApplication:
          'Si no va a cambiar al solicitante principal ni a ningún miembro del hogar, puede simplemente enviar otra solicitud.  Tomaremos el último enviado, según la política de solicitud de duplicados.',
        otherChanges:
          'Para otros cambios, comuníquese con doorway@bayareametro.gov',
      },
    });
    await this.updateTranslationsForLanguage(LanguagesEnum.tl, {
      lotteryAvailable: {
        duplicatesDetails:
          'Ang Doorway sa pangkalahatan ay hindi tumatanggap ng mga duplicate na aplikasyon. Ang isang duplicate na aplikasyon ay isa na mayroong isang tao na lumilitaw din sa isa pang aplikasyon para sa parehong pagkakataon sa pabahay. Para sa mas detalyadong impormasyon sa kung paano namin pinangangasiwaan ang mga duplicate, tingnan ang aming',
        termsOfUse: 'Mga Tuntunin ng Paggamit',
      },
    });
    await this.updateTranslationsForLanguage(LanguagesEnum.vi, {
      lotteryAvailable: {
        duplicatesDetails:
          'Doorway thường không chấp nhận các đơn xin trùng lặp. Một đơn xin trùng lặp là đơn xin có người cũng xuất hiện trên một đơn xin khác cho cùng một cơ hội nhà ở. Để biết thông tin chi tiết hơn về cách chúng tôi xử lý các đơn xin trùng lặp, hãy xem của chúng tôi',
        termsOfUse: 'Điều khoản sử dụng',
      },
      confirmation: {
        submitAnotherApplication:
          'Nếu bạn không thay đổi người nộp đơn chính hoặc bất kỳ thành viên nào trong gia đình, bạn chỉ cần gửi đơn đăng ký khác.  Chúng tôi sẽ lấy bản cuối cùng được gửi theo chính sách đăng ký trùng lặp.',
        otherChanges:
          'Đối với những thay đổi khác, vui lòng liên hệ với Door@bayareametro.gov.',
      },
    });
    await this.updateTranslationsForLanguage(LanguagesEnum.zh, {
      lotteryAvailable: {
        duplicatesDetails:
          'Doorway 一般不接受重复申请。重复申请是指申请者与另一份申请者有相同的住房机会。有关我们如何处理重复申请的更多详细信息，请参阅我们的',
        termsOfUse: '使用条款',
      },
      confirmation: {
        submitAnotherApplication:
          '如果你不改變主申請人或任何家庭成員，你可以提交另一份申請。  我們將根據重複申請政策採用最後提交的一份申請。',
        otherChanges: '如需其他變更，請聯絡doorway@bayareametro.gov。',
      },
    });

    await this.markScriptAsComplete(
      'add duplicates information to lottery email',
      requestingUser,
    );
    return { success: true };
  }

  /**
   *
   * @param req incoming request object
   * @param jurisdictionIdDTO id containing the jurisdiction id we are creating the new community type for
   * @param name name of the community type
   * @param name description of the community type
   * @returns successDTO
   * @description creates a new reserved community type. Reserved community types also need translations added
   */
  async createNewReservedCommunityType(
    req: ExpressRequest,
    jurisdictionId: string,
    name: string,
    description?: string,
  ): Promise<SuccessDTO> {
    // script runner standard start up
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart(
      `${name} Type - ${jurisdictionId}`,
      requestingUser,
    );

    // create new reserved community type using the passed in params
    await this.prisma.reservedCommunityTypes.create({
      data: {
        name: name,
        description: description,
        jurisdictions: {
          connect: {
            id: jurisdictionId,
          },
        },
      },
    });

    // script runner standard spin down
    await this.markScriptAsComplete(
      `${name} Type - ${jurisdictionId}`,
      requestingUser,
    );
    return { success: true };
  }

  /**
   *
   * @param req incoming request object
   * @returns successDTO
   * @description updates single use code translations to show extended expiration time
   */
  async updateCodeExpirationTranslations(
    req: ExpressRequest,
  ): Promise<SuccessDTO> {
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart(
      'update code expiration translations',
      requestingUser,
    );

    const translations = await this.prisma.translations.findFirst({
      where: { language: 'en', jurisdictionId: null },
    });
    const translationsJSON =
      translations.translations as unknown as Prisma.JsonArray;

    await this.prisma.translations.update({
      where: { id: translations.id },
      data: {
        translations: {
          ...translationsJSON,
          singleUseCodeEmail: {
            greeting: 'Hi',
            message:
              'Use the following code to sign in to your Doorway account. This code will be valid for 10 minutes. Never share this code.',
            singleUseCode: '%{singleUseCode}',
          },
        },
      },
    });

    await this.markScriptAsComplete(
      'update code expiration translations',
      requestingUser,
    );
    return { success: true };
  }

  /**
    Marks all program multiselect questions as hidden from listings so they don't show on the public site details page
  */
  async hideProgramsFromListings(req: ExpressRequest): Promise<SuccessDTO> {
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart('hideProgramsFromListings', requestingUser);
    await this.prisma.multiselectQuestions.updateMany({
      data: {
        hideFromListing: true,
      },
      where: {
        applicationSection: MultiselectQuestionsApplicationSectionEnum.programs,
      },
    });
    await this.markScriptAsComplete('hideProgramsFromListings', requestingUser);
    return { success: true };
  }

  async removeWorkAddresses(req: ExpressRequest): Promise<SuccessDTO> {
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart('remove work addresses', requestingUser);

    let applicantLoop = true;

    while (applicantLoop) {
      const rawApplicants = await this.prisma.applicant.findMany({
        select: {
          id: true,
          workAddressId: true,
        },
        where: {
          workAddressId: {
            not: null,
          },
        },
        take: 10000,
      });

      if (!rawApplicants?.length) {
        applicantLoop = false;
      } else {
        console.log(
          `${rawApplicants.length} applicant work addresses to remove`,
        );

        await this.prisma.applicant.updateMany({
          data: {
            workAddressId: null,
          },
          where: {
            id: {
              in: rawApplicants.map((applicant) => applicant.id),
            },
          },
        });

        await this.prisma.address.deleteMany({
          where: {
            id: {
              in: rawApplicants.map((applicant) => applicant.workAddressId),
            },
          },
        });
      }
    }
    console.log(`All applicant work addresses have been removed`);

    let householdLoop = true;

    while (householdLoop) {
      const rawHouseholdMembers = await this.prisma.householdMember.findMany({
        select: {
          id: true,
          workAddressId: true,
        },
        where: {
          workAddressId: {
            not: null,
          },
        },
        take: 10000,
      });

      if (!rawHouseholdMembers?.length) {
        householdLoop = false;
      } else {
        console.log(
          `${rawHouseholdMembers.length} household member work addresses to remove`,
        );

        await this.prisma.householdMember.updateMany({
          data: {
            workAddressId: null,
          },
          where: {
            id: {
              in: rawHouseholdMembers.map((member) => member.id),
            },
          },
        });

        await this.prisma.address.deleteMany({
          where: {
            id: {
              in: rawHouseholdMembers.map((member) => member.workAddressId),
            },
          },
        });
      }
    }
    console.log(`All household member work addresses have been removed`);

    await this.markScriptAsComplete('remove work addresses', requestingUser);
    return { success: true };
  }

  /**
   *
   * @param req incoming request object
   * @returns successDTO
   * @description updates single use code translations to show extended expiration time
   */
  async addNoticeToListingOpportunityEmail(
    req: ExpressRequest,
  ): Promise<SuccessDTO> {
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart(
      'add notice translation for listing opportunity email',
      requestingUser,
    );

    await this.updateTranslationsForLanguage(LanguagesEnum.en, {
      rentalOpportunity: {
        viewListingNotice:
          'Please view listing for the most updated information',
      },
    });
    await this.updateTranslationsForLanguage(LanguagesEnum.es, {
      rentalOpportunity: {
        viewListingNotice:
          'Consulte el listado para obtener la información más actualizada',
      },
    });
    await this.updateTranslationsForLanguage(LanguagesEnum.tl, {
      rentalOpportunity: {
        viewListingNotice:
          'Mangyaring tingnan ang listahan para sa pinakabagong impormasyon',
      },
    });
    await this.updateTranslationsForLanguage(LanguagesEnum.vi, {
      rentalOpportunity: {
        viewListingNotice: 'Vui lòng xem danh sách để biết thông tin mới nhất',
      },
    });
    await this.updateTranslationsForLanguage(LanguagesEnum.zh, {
      rentalOpportunity: {
        viewListingNotice: '请查看列表以获取最新信息',
      },
    });

    await this.markScriptAsComplete(
      'add notice translation for listing opportunity email',
      requestingUser,
    );
    return { success: true };
  }

  /**
    Adds all existing feature flags across Bloom to the database
  */
  async addFeatureFlags(req: ExpressRequest): Promise<SuccessDTO> {
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart('add feature flags', requestingUser);

    const results = await Promise.all(
      this.featureFlags.map(async (flag) => {
        try {
          await this.featureFlagService.create(flag);
        } catch (e) {
          console.log(
            `feature flag ${flag.name} failed to be created. Error: ${e}`,
          );
        }
      }),
    );

    console.log(`Number of feature flags created: ${results.length}`);

    await this.markScriptAsComplete('add feature flags', requestingUser);
    return { success: true };
  }

  /**
    this is simply an example
  */
  async example(req: ExpressRequest): Promise<SuccessDTO> {
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart('example', requestingUser);
    const rawJurisdictions = await this.prisma.jurisdictions.findMany();
    await this.markScriptAsComplete('example', requestingUser);
    return { success: !!rawJurisdictions.length };
  }

  // |------------------ HELPERS GO BELOW ------------------ | //

  /**
   *
   * @param scriptName the name of the script that is going to be run
   * @param userTriggeringTheRun the user that is attempting to trigger the script run
   * @description this checks to see if the script has already ran, if not marks the script in the db
   */
  async markScriptAsRunStart(
    scriptName: string,
    userTriggeringTheRun: User,
  ): Promise<void> {
    // check to see if script is already ran in db
    const storedScriptRun = await this.prisma.scriptRuns.findUnique({
      where: {
        scriptName,
      },
    });

    if (storedScriptRun?.didScriptRun) {
      // if script run has already successfully completed throw already succeed error
      throw new BadRequestException(
        `${scriptName} has already been run and succeeded`,
      );
    } else if (storedScriptRun?.didScriptRun === false) {
      // if script run was attempted but failed, throw attempt already failed error
      throw new BadRequestException(
        `${scriptName} has an attempted run and it failed, or is in progress. If it failed, please delete the db entry and try again`,
      );
    } else {
      // if no script run has been attempted create script run entry
      await this.prisma.scriptRuns.create({
        data: {
          scriptName,
          triggeringUser: userTriggeringTheRun.id,
        },
      });
    }
  }

  /**
   *
   * @param scriptName the name of the script that is going to be run
   * @param userTriggeringTheRun the user that is setting the script run as successfully completed
   * @description this marks the script run entry in the db as successfully completed
   */
  async markScriptAsComplete(
    scriptName: string,
    userTriggeringTheRun: User,
  ): Promise<void> {
    await this.prisma.scriptRuns.update({
      data: {
        didScriptRun: true,
        triggeringUser: userTriggeringTheRun.id,
      },
      where: {
        scriptName,
      },
    });
  }

  async updateTranslationsForLanguage(
    language: LanguagesEnum,
    newTranslations: Record<string, any>,
    createIfMissing?: boolean,
  ) {
    let translations;
    translations = await this.prisma.translations.findMany({
      where: { language },
    });

    if (!translations?.length) {
      if (createIfMissing) {
        const createdTranslations = await this.prisma.translations.create({
          data: {
            language: language,
            translations: {},
            jurisdictions: undefined,
          },
        });
        translations = [createdTranslations];
      } else {
        console.log(
          `Translations for ${language} don't exist in Doorway database`,
        );
        return;
      }
    }

    for (const translation of translations) {
      const translationsJSON = translation.translations as Prisma.JsonObject;

      Object.keys(newTranslations).forEach((key) => {
        translationsJSON[key] = {
          ...((translationsJSON[key] || {}) as Prisma.JsonObject),
          ...newTranslations[key],
        };
      });

      // technique taken from
      // https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields#advanced-example-update-a-nested-json-key-value
      const dataClause = Prisma.validator<Prisma.TranslationsUpdateInput>()({
        translations: translationsJSON,
      });

      await this.prisma.translations.update({
        where: { id: translation.id },
        data: dataClause,
      });
    }
  }

  /**
   *
   * @param req incoming request object
   * @returns successDTO
   * @description update household member relationships
   */
  async updateHouseholdMemberRelationships(
    req: ExpressRequest,
  ): Promise<SuccessDTO> {
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart(
      'update household member relationships',
      requestingUser,
    );

    const updateRelationship = async (
      prev: string,
      updated: HouseholdMemberRelationship,
    ) => {
      const result = await this.prisma.householdMember.updateMany({
        data: {
          relationship: updated,
        },
        where: {
          relationship: prev,
        },
      });

      console.log(
        `updated relationship from ${prev} to ${updated} for ${
          result?.count ?? 0
        } household members`,
      );
    };

    updateRelationship('spouse', HouseholdMemberRelationship.spousePartner);
    updateRelationship(
      'registeredDomesticPartner',
      HouseholdMemberRelationship.spousePartner,
    );
    updateRelationship('sibling', HouseholdMemberRelationship.brotherSister);
    updateRelationship('aunt', HouseholdMemberRelationship.auntUncle);
    updateRelationship('uncle', HouseholdMemberRelationship.auntUncle);
    updateRelationship('nephew', HouseholdMemberRelationship.nephewNiece);
    updateRelationship('niece', HouseholdMemberRelationship.nephewNiece);
    updateRelationship(
      'grandparent',
      HouseholdMemberRelationship.grandparentGreatGrandparent,
    );
    updateRelationship(
      'greatGrandparent',
      HouseholdMemberRelationship.grandparentGreatGrandparent,
    );
    updateRelationship('inLaw', HouseholdMemberRelationship.other);

    await this.markScriptAsComplete(
      'update household member relationships',
      requestingUser,
    );
    return { success: true };
  }

  /**
   *
   * @param req incoming request object
   * @returns successDTO
   * @description remove empty race inputs
   */
  async removeEmptyRaceInputs(req: ExpressRequest): Promise<SuccessDTO> {
    const requestingUser = mapTo(User, req['user']);
    await this.markScriptAsRunStart('remove empty race inputs', requestingUser);
    const allRaceDemographics = await this.prisma.demographics.findMany({
      select: { id: true, race: true },
      where: {
        race: { isEmpty: false },
      },
    });

    const emptyInputPattern = /:  +$/;
    const cleanedDemoData = allRaceDemographics.reduce((cleanedArr, demo) => {
      if (demo.race.some((raceInput) => emptyInputPattern.test(raceInput))) {
        const cleanedInput = demo.race.map((raceInput) =>
          raceInput.replace(emptyInputPattern, ''),
        );
        cleanedArr.push({ ...demo, race: cleanedInput });
      }
      return cleanedArr;
    }, []);

    cleanedDemoData.forEach(async (cleanedDemo) => {
      await this.prisma.demographics.update({
        where: {
          id: cleanedDemo.id,
        },
        data: {
          race: cleanedDemo.race,
        },
      });
    });
    await this.markScriptAsComplete('remove empty race inputs', requestingUser);
    return { success: true };
  }

  async addLotteryTranslationsHelper(createIfMissing?: boolean) {
    const enKeys = {
      lotteryReleased: {
        header: 'Lottery results for %{listingName} are ready to be published',
        adminApprovedStart:
          'Lottery results for %{listingName} have been released for publication. Please go to the listing view in your',
        adminApprovedEnd:
          'to view the lottery tab and release the lottery results.',
      },
      lotteryPublished: {
        header: 'Lottery results have been published for %{listingName}',
        resultsPublished:
          'Lottery results for %{listingName} have been published to applicant accounts.',
      },
      lotteryAvailable: {
        header: 'New Housing Lottery Results Available',
        resultsAvailable:
          'Results are available for a housing lottery for %{listingName}. See your Doorway Housing Portal account for more information.',
        signIn: 'Sign In to View Your Results',
        whatHappensHeader: 'What happens next?',
        whatHappensContent:
          'The property manager will begin to contact applicants by their preferred contact method. They will do so in the order of lottery rank, within each lottery preference. When the units are all filled, the property manager will stop contacting applicants. All the units could be filled before the property manager reaches your rank. If this happens, you will not be contacted.',
        otherOpportunities1:
          'To view other housing opportunities, please visit %{appUrl}. You can sign up to receive notifications of new application opportunities',
        otherOpportunities2: 'here',
        otherOpportunities3:
          'If you want to learn about how lotteries work, please see the lottery section of the',
        otherOpportunities4: 'Doorway Housing Portal Help Center',
      },
    };

    const esKeys = {
      lotteryAvailable: {
        header: 'Nuevos resultados de la lotería de vivienda disponibles',
        resultsAvailable:
          'Los resultados están disponibles para una lotería de vivienda para %{listingName}. Consulte su cuenta del portal de vivienda para obtener más información.',
        signIn: 'Inicie sesión para ver sus resultados',
        whatHappensHeader: '¿Qué pasa después?',
        whatHappensContent:
          'El administrador de la propiedad comenzará a comunicarse con los solicitantes mediante su método de contacto preferido. Lo harán en el orden de clasificación de la lotería, dentro de cada preferencia de lotería. Cuando todas las unidades estén ocupadas, el administrador de la propiedad dejará de comunicarse con los solicitantes. Todas las unidades podrían llenarse antes de que el administrador de la propiedad alcance su rango. Si esto sucede, no lo contactaremos.',
        otherOpportunities1:
          'Para ver otras oportunidades de vivienda, visite %{appUrl}. Puede registrarse para recibir notificaciones de nuevas oportunidades de solicitud',
        otherOpportunities2: 'aquí',
        otherOpportunities3:
          'Si desea obtener información sobre cómo funcionan las loterías, consulte la sección de lotería del',
        otherOpportunities4: 'Doorway Housing Portal Centro de ayuda',
      },
    };

    const tlKeys = {
      lotteryAvailable: {
        header: 'Bagong Housing Lottery Resulta Available',
        resultsAvailable:
          'Available ang mga resulta para sa isang housing lottery para sa %{listingName}. Tingnan ang iyong housing portal account para sa higit pang impormasyon.',
        signIn: 'Mag-sign In upang Tingnan ang Iyong Mga Resulta',
        whatHappensHeader: 'Anong mangyayari sa susunod?',
        whatHappensContent:
          'Magsisimulang makipag-ugnayan ang property manager sa mga aplikante sa pamamagitan ng kanilang gustong paraan ng pakikipag-ugnayan. Gagawin nila ito sa pagkakasunud-sunod ng ranggo ng lottery, sa loob ng bawat kagustuhan sa lottery. Kapag napuno na ang lahat ng unit, hihinto na ang property manager sa pakikipag-ugnayan sa mga aplikante. Maaaring mapunan ang lahat ng unit bago maabot ng property manager ang iyong ranggo. Kung mangyari ito, hindi ka makontak.',
        otherOpportunities1:
          'Upang tingnan ang iba pang pagkakataon sa pabahay, pakibisita ang %{appUrl}. Maaari kang mag-sign up upang makatanggap ng mga abiso ng mga bagong pagkakataon sa aplikasyon',
        otherOpportunities2: 'dito',
        otherOpportunities3:
          'Kung gusto mong malaman kung paano gumagana ang mga lottery, pakitingnan ang seksyon ng lottery ng',
        otherOpportunities4: 'Doorway Housing Portal Help Center',
      },
    };

    const viKeys = {
      lotteryAvailable: {
        header: 'Đã có kết quả xổ số nhà ở mới',
        resultsAvailable:
          'Đã có kết quả xổ số nhà ở cho %{listingName}. Xem tài khoản cổng thông tin nhà ở của bạn để biết thêm thông tin.',
        signIn: 'Đăng nhập để xem kết quả của bạn',
        whatHappensHeader: 'Chuyện gì xảy ra tiếp theo?',
        whatHappensContent:
          'Người quản lý tài sản sẽ bắt đầu liên hệ với người nộp đơn bằng phương thức liên hệ ưa thích của họ. Họ sẽ làm như vậy theo thứ tự xếp hạng xổ số, trong mỗi ưu tiên xổ số. Khi các căn hộ đã được lấp đầy, người quản lý tài sản sẽ ngừng liên hệ với người nộp đơn. Tất cả các đơn vị có thể được lấp đầy trước khi người quản lý tài sản đạt đến cấp bậc của bạn. Nếu điều này xảy ra, bạn sẽ không được liên lạc.',
        otherOpportunities1:
          'Để xem các cơ hội nhà ở khác, vui lòng truy cập %{appUrl}. Bạn có thể đăng ký để nhận thông báo về các cơ hội ứng tuyển mới',
        otherOpportunities2: 'đây',
        otherOpportunities3:
          'Nếu bạn muốn tìm hiểu về cách hoạt động của xổ số, vui lòng xem phần xổ số của',
        otherOpportunities4: 'Doorway Housing Portal Trung tâm trợ giúp',
      },
    };

    const zhKeys = {
      lotteryAvailable: {
        header: '新住房抽籤結果公佈',
        resultsAvailable:
          '%{listingName} 的住房抽籤結果可用。請參閱您的住房入口網站帳戶以獲取更多資訊。',
        signIn: '登入查看您的結果',
        whatHappensHeader: '接下來發生什麼事？',
        whatHappensContent:
          '物業經理將開始透過申請人首選的聯絡方式與申請人聯繫。他們將按照每個彩票偏好中的彩票排名順序進行操作。當單位全部住滿後，物業經理將停止聯絡申請人。在物業經理達到您的等級之前，所有單位都可以被填滿。如果發生這種情況，我們將不會與您聯繫。',
        otherOpportunities1:
          '要查看其他住房機會，請訪問 %{appUrl}。您可以註冊接收新申請機會的通知',
        otherOpportunities2: '這裡',
        otherOpportunities3: '如果您想了解彩票的運作方式，請參閱網站的彩票部分',
        otherOpportunities4: 'Doorway Housing Portal 幫助中心',
      },
    };
    await this.updateTranslationsForLanguage(
      LanguagesEnum.en,
      enKeys,
      createIfMissing,
    );
    await this.updateTranslationsForLanguage(
      LanguagesEnum.es,
      esKeys,
      createIfMissing,
    );
    await this.updateTranslationsForLanguage(
      LanguagesEnum.tl,
      tlKeys,
      createIfMissing,
    );
    await this.updateTranslationsForLanguage(
      LanguagesEnum.vi,
      viKeys,
      createIfMissing,
    );
    await this.updateTranslationsForLanguage(
      LanguagesEnum.zh,
      zhKeys,
      createIfMissing,
    );
  }

  featureFlags = [
    {
      name: 'enableSingleUseCode',
      description:
        'When true, the backend allows for logging into this jurisdiction using the single use code flow',
      active: false,
    },
    {
      name: 'enableAccessibiliyFeatures',
      description:
        "When true, the 'accessibility features' section is displayed in listing creation/edit and the public listing view",
      active: false,
    },
    {
      name: 'enableGeocodingPreferences',
      description:
        'When true, preferences can be created with geocoding functionality and when an application is created/updated on a listing that is geocoding then the application gets geocoded',
      active: false,
    },
    {
      name: 'enableGeocodingRadiusMethod',
      description:
        'When true, preferences can be created with geocoding functionality that verifies via a mile radius',
      active: false,
    },
    {
      name: 'enableListingOpportunity',
      description:
        "When true, any newly published listing will send a gov delivery email to everyone that has signed up for the 'listing alerts'",
      active: false,
    },
    {
      name: 'enablePartnerDemographics',
      description:
        'When true, demographics data is included in application or lottery exports for partners',
      active: false,
    },
    {
      name: 'enablePartnerSettings',
      description:
        "When true, the 'settings' tab in the partner site is visible",
      active: false,
    },
    {
      name: 'enableUtilitiesIncluded',
      description:
        "When true, the 'utilities included' section is displayed in listing creation/edit and the public listing view",
      active: false,
    },
    {
      name: 'exportApplicationAsSpreadsheet',
      description:
        'When true, the application export is done as an Excel spreadsheet',
      active: false,
    },
    {
      name: 'limitClosedListingActions',
      description:
        'When true, availability of edit, republish, and reopen functionality is limited for closed listings',
      active: false,
    },
    {
      name: 'showLottery',
      description:
        'When true, show lottery tab on lottery listings on the partners site',
      active: false,
    },
    {
      name: 'showMandatedAccounts',
      description:
        'When true, require users to be logged in to submit an application on the public site',
      active: false,
    },
    {
      name: 'showProfessionalPartners',
      description:
        'When true, show a navigation bar link to professional partners',
      active: false,
    },
    {
      name: 'showPublicLottery',
      description:
        'When true, show lottery section on the user applications page',
      active: false,
    },
    {
      name: 'showPwdless',
      description:
        "When true, show the 'get code to sign in' button on public sign in page for the pwdless flow",
      active: false,
    },
    {
      name: 'showSmsMfa',
      description:
        "When true, show the 'sms' button option when a user goes through multi factor authentication",
      active: false,
    },
  ];
}
