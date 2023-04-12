import { Transformer, defaultMap } from "../../.build/src/etl/transformer"

describe('Transformer', () => {

  it('should treat a string value as a property name', () => {
    const transformer = new Transformer({
      value: "myPropertyName"
    })

    const testValue = "some-test-value"

    const result = transformer.mapObjToRow({
      myPropertyName: testValue
    })

    expect(result).toHaveProperty('value', testValue)
  })

  it('should call a function to get a value', () => {
    const transformer = new Transformer({
      sum: obj => obj.x + obj.y
    })

    const result = transformer.mapObjToRow({
      x: 1,
      y: 5
    })

    expect(result).toHaveProperty('sum', 6)
  })

  it('should error on an unexpected map value', () => {
    const transformer = new Transformer({
      num: 3
    })

    expect( () => {
      const result = transformer.mapObjToRow({
        foo: 'bar'
      })
    }).toThrow()
  })

  it('should map all results', () => {
    const transformer = new Transformer({
      name: 'name'
    })

    const result = transformer.mapAll([
      {
        name: "test1"
      },
      {
        name: "test2",
      },
      {
        name: "test3",
      },
    ])

    expect(result).toHaveLength(3)
  })

  /*
  it('should have a valid default map', () => {
    const transformer = new Transformer(defaultMap)

    const listing = JSON.parse(`{
      "id":"6239c2ee-9f1c-4dcd-83a9-c2c4d6f1631f",
      "assets":[
        {
          "fileId":"https://regional-dahlia-staging.s3-us-west-1.amazonaws.com/listings/triton/thetriton.png",
          "label":"building"
        }
      ],
      "unitsAvailable":2,
      "applicationDueDate":"2023-04-12T22:52:06.244Z",
      "applicationOpenDate":"2023-04-02T22:52:06.244Z",
      "name":"[doorway] Test: Default, No Preferences",
      "waitlistCurrentSize":null,
      "waitlistMaxSize":null,
      "status":"active",
      "reviewOrderType":"lottery",
      "showWaitlist":false,
      "publishedAt":"2023-04-07T21:52:06.206Z",
      "closedAt":null,
      "images":[
        {
          "ordinal":1,
          "image":{
            "fileId":"https://regional-dahlia-staging.s3-us-west-1.amazonaws.com/listings/triton/thetriton.png",
            "label":"building",
            "id":"0aea3036-cab5-4cfd-8c2d-856e5a679559"
          }
        }
      ],
      "jurisdiction":{
        "id":"804e0977-0f80-45e9-805d-28f6ec616ebb",
        "name":"Bay Area"
      },
      "reservedCommunityType":null,
      "units":[
        {
          "id":"6e0d95b9-e2ee-4eb3-9b1f-2e87cae1b0ef",
          "monthlyIncomeMin":"3468",
          "floor":2,
          "maxOccupancy":5,
          "minOccupancy":2,
          "monthlyRent":"1387",
          "sqFeet":748,
          "monthlyRentAsPercentOfIncome":null,
          "unitType":{
            "name":"twoBdrm",
            "id":"0f7d5a7c-3973-4300-a3ce-de04fdfae4c7"
          }
        },
        {
          "id":"ee4afbaa-0ccf-4c1b-975a-732bd51d8992",
          "monthlyIncomeMin":"3014",
          "floor":1,
          "maxOccupancy":3,
          "minOccupancy":1,
          "monthlyRent":"1219",
          "sqFeet":635,
          "monthlyRentAsPercentOfIncome":null,
          "unitType":{
            "name":"oneBdrm",
            "id":"dd73968a-e347-417c-8967-f3450176f4e2"
          }
        }
      ],
      "buildingAddress":{
        "city":"San Francisco",
        "state":"CA",
        "street":"548 Market Street",
        "street2":"Suite #59930",
        "zipCode":"94104",
        "latitude":37.789673,
        "longitude":-122.40151
      },
      "urlSlug":"doorway_test_default_no_preferences_548_market_street_san_francisco_ca",
      "countyCode":"Bay Area",
      "features":null,
      "utilities":null
    }`)

    const result = transformer.mapAll([
      {
        name: "test1"
      },
      {
        name: "test2",
      },
      {
        name: "test3",
      },
    ])

    expect(result).toHaveLength(3)
  })
  */
})
