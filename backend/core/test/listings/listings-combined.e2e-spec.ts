import { HttpModule } from "@nestjs/axios"
import { Test } from "@nestjs/testing"
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm"
import supertest from "supertest"
import { ListingsModule } from "../../src/listings/listings.module"
import { applicationSetup } from "../../src/app.module"
import { ListingDto } from "../../src/listings/dto/listing.dto"
import { getUserAccessToken } from "../utils/get-user-access-token"
import { setAuthorization } from "../utils/set-authorization-helper"
import { AssetCreateDto } from "../../src/assets/dto/asset.dto"
import { ApplicationMethodCreateDto } from "../../src/application-methods/dto/application-method.dto"
import { ApplicationMethodType } from "../../src/application-methods/types/application-method-type-enum"
import { ApplicationSection, Language } from "../../types"
import { AssetsModule } from "../../src/assets/assets.module"
import { ApplicationMethodsModule } from "../../src/application-methods/applications-methods.module"
import { PaperApplicationsModule } from "../../src/paper-applications/paper-applications.module"
import { ListingEventCreateDto } from "../../src/listings/dto/listing-event.dto"
import { ListingEventType } from "../../src/listings/types/listing-event-type-enum"
import { Listing } from "../../src/listings/entities/listing.entity"
import qs from "qs"
import { ListingUpdateDto } from "../../src/listings/dto/listing-update.dto"
import { MultiselectQuestion } from "../../src//multiselect-question/entities/multiselect-question.entity"
import { Repository } from "typeorm"
import { INestApplication } from "@nestjs/common"
import { Jurisdiction } from "../../src/jurisdictions/entities/jurisdiction.entity"
import { makeTestListing } from "../utils/make-test-listing"

// eslint-disable-next-line @typescript-eslint/no-var-requires
import dbOptions from "../../ormconfig.test"
import { MultiselectQuestionDto } from "../../src/multiselect-question/dto/multiselect-question.dto"

// Cypress brings in Chai types for the global expect, but we want to use jest
// expect here so we need to re-declare it.
// see: https://github.com/cypress-io/cypress/issues/1319#issuecomment-593500345
declare const expect: jest.Expect
jest.setTimeout(30000)

// REMOVE_WHEN_EXTERNAL_NOT_NEEDED
describe("CombinedListings", () => {
  let app: INestApplication
  let questionRepository: Repository<MultiselectQuestion>
  let adminAccessToken: string
  let jurisdictionsRepository: Repository<Jurisdiction>

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(dbOptions),
        TypeOrmModule.forFeature([Jurisdiction]),
        ListingsModule,
        AssetsModule,
        ApplicationMethodsModule,
        PaperApplicationsModule,
        TypeOrmModule.forFeature([MultiselectQuestion]),
        HttpModule,
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    app = applicationSetup(app)
    await app.init()
    questionRepository = app.get<Repository<MultiselectQuestion>>(
      getRepositoryToken(MultiselectQuestion)
    )
    adminAccessToken = await getUserAccessToken(app, "admin@example.com", "abcdef")
    jurisdictionsRepository = moduleRef.get<Repository<Jurisdiction>>(
      getRepositoryToken(Jurisdiction)
    )
  })

  describe("/listings/combined", () => {
    it("should return all listings", async () => {
      const res = await supertest(app.getHttpServer()).get("/listings/combined").expect(200)
      expect(res.body.items.map((listing) => listing.id).length).toBeGreaterThan(0)
    })

    it("should return the first page of paginated listings", async () => {
      // Make the limit 1 less than the full number of listings, so that the first page contains all
      // but the last listing.
      const page = "1"
      // This is the number of listings in ../../src/seed.ts minus 1
      const limit = 15
      const params = "/?page=" + page + "&limit=" + limit.toString()
      const res = await supertest(app.getHttpServer())
        .get("/listings/combined" + params)
        .expect(200)
      expect(res.body.items.length).toEqual(limit)
    })

    it("should return the last page of paginated listings", async () => {
      // Make the limit 1 less than the full number of listings, so that the second page contains
      // only one listing.
      // query to get max number of listings
      let queryParams = {
        limit: 1,
        page: 1,
        view: "base",
      }
      let query = qs.stringify(queryParams)
      let res = await supertest(app.getHttpServer()).get(`/listings/combined?${query}`).expect(200)
      const totalItems = res.body.meta.totalItems

      queryParams = {
        limit: totalItems - 1,
        page: 2,
        view: "base",
      }
      query = qs.stringify(queryParams)
      res = await supertest(app.getHttpServer()).get(`/listings/combined?${query}`).expect(200)
      expect(res.body.items.length).toEqual(1)
    })

    it("should return listings with matching zipcodes", async () => {
      const queryParams = {
        limit: "all",
        filter: [
          {
            $comparison: "IN",
            zipcode: "94621,94404",
          },
        ],
        view: "base",
      }
      const query = qs.stringify(queryParams)
      await supertest(app.getHttpServer()).get(`/listings/combined?${query}`).expect(200)
    })

    it("should have listings associated with the Bay Area", async () => {
      const jurisdictions = await jurisdictionsRepository.find()
      const bayArea = jurisdictions.find((jurisdiction) => jurisdiction.name === "Bay Area")
      const queryParamsOnlyBayArea = {
        limit: "all",
        view: "base",
        filter: [
          {
            $comparison: "=",
            jurisdiction: bayArea.id,
          },
        ],
      }
      const resBayArea = await supertest(app.getHttpServer())
        .get(`/listings/combined?${qs.stringify(queryParamsOnlyBayArea)}`)
        .expect(200)
      expect(resBayArea.body.items.length).not.toBe(0)
    })

    it("defaults to sorting listings by applicationDueDate", async () => {
      const res = await supertest(app.getHttpServer())
        .get(`/listings/combined?limit=all`)
        .expect(200)
      const listings = res.body.items

      // The Coliseum seed has the soonest applicationDueDate (1 day in the future)
      expect(listings[0].name).toBe("[doorway] Test: Coliseum")

      // Triton and "Default, No Preferences" share the next-soonest applicationDueDate
      const secondListing = listings[1]
      const thirdListing = listings[2]
      expect(thirdListing.name).toBe("[doorway] Test: Default, No Preferences")

      const secondListingAppDueDate = new Date(secondListing.applicationDueDate)
      const thirdListingAppDueDate = new Date(thirdListing.applicationDueDate)
      expect(secondListingAppDueDate.getDate()).toEqual(thirdListingAppDueDate.getDate())

      // Verify that listings with null applicationDueDate's appear at the end.
      const lastListing = listings[listings.length - 1]
      expect(lastListing.applicationDueDate).toBeNull()
    })

    it("sorts listings by most recently updated when that orderBy param is set", async () => {
      const res = await supertest(app.getHttpServer())
        .get(`/listings/combined?orderBy[0]=mostRecentlyUpdated&orderDir[0]=DESC&limit=all`)
        .expect(200)
      for (let i = 0; i < res.body.items.length - 1; ++i) {
        const currentUpdatedAt = new Date(res.body.items[i].updatedAt)
        const nextUpdatedAt = new Date(res.body.items[i + 1].updatedAt)

        // Verify that each listing's updatedAt timestamp is more recent than the next listing's.
        expect(currentUpdatedAt.getTime()).toBeGreaterThan(nextUpdatedAt.getTime())
      }
    })

    it("fails if orderBy param doesn't conform to one of the enum values", async () => {
      await supertest(app.getHttpServer())
        .get(`/listings/combined?orderBy=notAValidOrderByParam`)
        .expect(400)
    })

    it("sorts results within a page, and across sequential pages", async () => {
      // Get the first page of 5 results.
      const firstPage = await supertest(app.getHttpServer())
        .get(`/listings/combined?orderBy[0]=mostRecentlyUpdated&orderDir[0]=DESC&limit=5&page=1`)
        .expect(200)

      // Verify that listings on the first page are ordered from most to least recently updated.
      for (let i = 0; i < 4; ++i) {
        const currentUpdatedAt = new Date(firstPage.body.items[i].updatedAt)
        const nextUpdatedAt = new Date(firstPage.body.items[i + 1].updatedAt)

        // Verify that each listing's updatedAt timestamp is more recent than the next listing's.
        expect(currentUpdatedAt.getTime()).toBeGreaterThan(nextUpdatedAt.getTime())
      }

      const lastListingOnFirstPageUpdateTimestamp = new Date(firstPage.body.items[4].updatedAt)

      // Get the second page of 5 results
      const secondPage = await supertest(app.getHttpServer())
        .get(`/listings/combined?orderBy[0]=mostRecentlyUpdated&orderDir[0]=DESC&limit=5&page=2`)
        .expect(200)

      // Verify that each of the listings on the second page was less recently updated than the last
      // first-page listing.
      for (const secondPageListing of secondPage.body.items) {
        const secondPageListingUpdateTimestamp = new Date(secondPageListing.updatedAt)
        expect(lastListingOnFirstPageUpdateTimestamp.getTime()).toBeGreaterThan(
          secondPageListingUpdateTimestamp.getTime()
        )
      }
    })

    it("should find listing by search", async () => {
      const anyJurisdiction = (await jurisdictionsRepository.find({ take: 1 }))[0]
      const newListingCreateDto = makeTestListing(anyJurisdiction.id)
  
       // must be different than the value in Listing test
      const newListingName = "combined-random-name"
      newListingCreateDto.name = newListingName
  
      let listingsSearchResponse = await supertest(app.getHttpServer())
        .get(`/listings/combined?search=random`)
        .expect(200)
  
      expect(listingsSearchResponse.body.items.length).toBe(0)
  
      // post to local listings endpoint, not combined
      const listingResponse = await supertest(app.getHttpServer())
        .post(`/listings`)
        .send(newListingCreateDto)
        .set(...setAuthorization(adminAccessToken))
      expect(listingResponse.body.name).toBe(newListingName)
  
      listingsSearchResponse = await supertest(app.getHttpServer()).get(`/listings/combined`).expect(200)
      expect(listingsSearchResponse.body.items.length).toBeGreaterThan(1)
  
      listingsSearchResponse = await supertest(app.getHttpServer())
        .get(`/listings/combined?search=random`)
        .expect(200)
  
      expect(listingsSearchResponse.body.items.length).toBe(1)
      expect(listingsSearchResponse.body.items[0].name).toBe(newListingName)
    })

    it("should not be marked as external when created", async () => {
      const anyJurisdiction = (await jurisdictionsRepository.find({ take: 1 }))[0]
      const newListingCreateDto = makeTestListing(anyJurisdiction.id)

      newListingCreateDto.name = "is-external-test"
      newListingCreateDto.isExternal = true // set explicitly to verify
  
      // post to local listings endpoint, not combined
      const listingResponse = await supertest(app.getHttpServer())
        .post(`/listings`)
        .send(newListingCreateDto)
        .set(...setAuthorization(adminAccessToken))
      expect(listingResponse.body.isExternal).toBe(false)
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await app.close()
  })
})
