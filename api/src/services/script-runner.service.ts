import { Injectable, BadRequestException } from '@nestjs/common';
import {
  ApplicationMethodsTypeEnum,
  MultiselectQuestionsApplicationSectionEnum,
  PrismaClient,
} from '@prisma/client';
import { Request as ExpressRequest } from 'express';
import { PrismaService } from './prisma.service';
import { SuccessDTO } from '../dtos/shared/success.dto';
import { User } from '../dtos/users/user.dto';
import { mapTo } from '../utilities/mapTo';
import { DataTransferDTO } from '../dtos/script-runner/data-transfer.dto';
import { AmiChartImportDTO } from '../dtos/script-runner/ami-chart-import.dto';
import { AmiChartCreate } from '../dtos/ami-charts/ami-chart-create.dto';
import { AmiChartService } from './ami-chart.service';

/**
  this is the service for running scripts
  most functions in here will be unique, but each function should only be allowed to fire once
*/
@Injectable()
export class ScriptRunnerService {
  constructor(
    private prisma: PrismaService,
    private amiChartService: AmiChartService,
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
            reservedCommunityTypes: reservedCommunityType
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
            afsLastRunAt: listing['afs_last_run'],
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
}
