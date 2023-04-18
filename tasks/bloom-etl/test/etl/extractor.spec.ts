import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { DefaultExtractor } from "../../src/etl"
import { Response } from "../../src/types";

const urlInfo = {
  base: "https://base-url",
  path: "/path"
}

const jurisdictions = [
  {
    id: "d98fd25b-df6c-4f6a-b93f-bbd347b9da69",
    name: "External Jurisdiction 1",
  },
  {
    id: "second",
    name: "External Jurisdiction 2"
  },
]

const listings = [
  {
    id: "2dfca9a5-6b01-4683-be1c-e3fa0880800f",
    assets: [
      {
        fileId: "https://url.to/some/external/image.jpg",
        label: "building",
      },
    ],
    householdSizeMin: 1,
    householdSizeMax: 3,
    unitsAvailable: 2,
    applicationOpenDate: new Date().toDateString(),
    applicationDueDate: new Date().toDateString(),
    name: "Test: External Listing - Full",
    waitlistCurrentSize: 0,
    waitlistMaxSize: 5,
    isWaitlistOpen: false,
    status: "active",
    reviewOrderType: "lottery",
    publishedAt: new Date().toDateString(),
    updatedAt: new Date().toDateString(),
    lastApplicationUpdateAt: new Date().toDateString(),
    reservedCommunityTypeName: "senior62",
    urlSlug: "test_external_listing_full",
    images: [],
    listingMultiselectQuestions: [
      {
        ordinal: 1,
        multiselectQuestion: {
          id: "cc213d2b-6d4b-48a3-8177-b51932002099",
        },
      },
      {
        ordinal: 2,
        multiselectQuestion: {
          id: "64d292c4-8b14-4a35-8d1a-89839f4a6806",
        },
      },
    ],
    jurisdiction: {
      id: "d98fd25b-df6c-4f6a-b93f-bbd347b9da69",
      name: "External Jurisdiction",
    },
    reservedCommunityType: {
      id: "8cf689ba-c820-4d61-a8ee-d76387a0e85a",
      name: "senior62",
    },
    units: [
      {
        monthlyIncomeMin: "1000.00",
        floor: 1,
        maxOccupancy: 3,
        minOccupancy: 1,
        monthlyRent: "1234.00",
        sqFeet: "1100",
        monthlyRentAsPercentOfIncome: null,
      },
      {
        monthlyIncomeMin: "2000.00",
        floor: 2,
        maxOccupancy: 5,
        minOccupancy: 2,
        monthlyRent: "5678.00",
        sqFeet: "1500",
        monthlyRentAsPercentOfIncome: null,
      },
    ],
    buildingAddress: {
      county: "San Alameda",
      city: "Anytown",
      street: "123 Sesame Street",
      zipCode: "90210",
      state: "CA",
      latitude: 37.7549632,
      longitude: -122.1968792,
    },
    features: {
      elevator: true,
      wheelchairRamp: false,
      serviceAnimalsAllowed: null,
      accessibleParking: true,
      parkingOnSite: false,
      inUnitWasherDryer: null,
      laundryInBuilding: true,
      barrierFreeEntrance: false,
      rollInShower: null,
      grabBars: true,
      heatingInUnit: false,
      acInUnit: null,
    },
    utilities: {
      water: true,
      gas: false,
      trash: null,
      sewer: true,
      electricity: false,
      cable: null,
      phone: true,
      internet: false,
    },
  },
  {
    id: "9beacfb5-9611-4e02-816f-89810b83d1ba",
    assets: [
      {
        fileId: "https://url.to/some/other/image.jpg",
        label: "building",
      },
    ],
    householdSizeMin: 1,
    householdSizeMax: 3,
    unitsAvailable: 0,
    applicationOpenDate: new Date().toDateString(),
    applicationDueDate: new Date().toDateString(),
    name: "Test: External Listing - Empty",
    waitlistCurrentSize: 0,
    waitlistMaxSize: 5,
    isWaitlistOpen: false,
    status: "active",
    reviewOrderType: "lottery",
    publishedAt: new Date().toDateString(),
    updatedAt: new Date().toDateString(),
    lastApplicationUpdateAt: new Date().toDateString(),
    reservedCommunityTypeName: null,
    urlSlug: "test_external_listing_empty",
    images: [],
    listingMultiselectQuestions: [],
    jurisdiction: {
      id: "d98fd25b-df6c-4f6a-b93f-bbd347b9da69",
      name: "External Jurisdiction",
    },
    reservedCommunityType: null,
    units: [],
    buildingAddress: {
      county: "San Alameda",
      city: "Anytown",
      street: "123 Sesame Street",
      zipCode: "90210",
      state: "CA",
      latitude: 37.7549632,
      longitude: -122.1968792,
    },
    features: null,
    utilities: null,
  },
]

describe('Extractor', () => {

  //const extractor = new DefaultExtractor(urlInfo, jurisdictions);

  /*
  jest.mock('axios', () => (
    {
      get: jest.fn((url) => {
        return Promise.resolve({
          data: { items: [] },
          status: 200,
          statusText: 'ok',
          headers: '',
          config: {},
        })
      })
    }
  ))
  //*/
  /*
  jest.mock('axios', () => jest.fn()
    .mockImplementation( (url) => {
      return Promise.resolve({
        data: {
          items: []
        }
      })
    })
  )
  */
  jest.mock('axios')
  const mockedAxios = axios as jest.Mocked<typeof axios>
  /*
  mockedAxios.get = jest.fn( <T, AxiosResponse<T, any>, any>(url, config?: AxiosRequestConfig): Promise<AxiosResponse<T, any>> => {
    return Promise.resolve({
      data: { items: [] },
      status: 200,
      statusText: 'ok',
      headers: '',
      config: {},
    })
  })
  */
  const extractor = new DefaultExtractor(mockedAxios, urlInfo, jurisdictions);

  beforeAll( () => {
    //console.log(mockedAxios)
    console.log(Object.keys(mockedAxios))
  })

  beforeEach( () => {
    //mockedAxios.get.mockReset()
    //jest.resetAllMocks()
  })

  it('generates the correct endpoint url', async () => {

    /*
    mockedAxios.get.mockImplementationOnce( (url) => {
      return Promise.resolve({
        data: {
          items: []
        }
      })
    })
    */

    
    /*
    mockedAxios.get.mockImplementation( (url) => {
      return Promise.resolve([])
    })
    //*/

    // the endpoint starts with base+path

    // the endpoint contains the jurisdiction id

    const results = await extractor.extract()

    //console.log(Object.keys(mockedAxios.get))

    //const constructEndpoint = jest.spyOn(extractor, 'constructEndpoint')

    // should be called once per jurisdiction
    //expect(mockedAxios.get).toHaveBeenCalledTimes(jurisdictions.length)
    expect(results.length).toBe(0)
  })

  it('should extract valid results', async () => {

    

    mockedAxios.get.mockImplementationOnce( (url) => {
      return Promise.resolve({
        data: {
          items: []
        }
      })
    })

    // axios.get() should be called once per jurisdiction

    // the length of the output should equal the sum of all test listing objects

    // the value for each output object should match the input

    const results = extractor.extract()

    //expect(results).toEqual(listings)
  })

  it('should fail on invalid results', async () => {
    
  })
})
