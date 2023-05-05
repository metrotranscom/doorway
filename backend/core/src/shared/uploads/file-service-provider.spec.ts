import { FileServiceProvider } from "./file-service-provider"
import { NullFileService } from "./null/null-file-service"

describe("FileServiceProvider", () => {
  it("should filter the config correctly", () => {
    const config = {
      "ignore_me_null_some_value": "ignore", // ignore due to prefix
      "prefix_notnull_some_value": "ignore", // ignore due to service name
      "prefix_null_UPPER": "valid",
      "prefix_null_lower": "valid",
      "prefix_null_uri_prefix": "required",
    }

    const serviceName = "null"
    const prefix = "prefix_"

    const provider = new FileServiceProvider(serviceName)
      .registerFileService("null", new NullFileService())
      .configure(config, prefix)

    const compare = {
      upper: "valid",
      lower: "valid",
      uri_prefix: "required",
    }

    expect(provider.activeFileService.config).toEqual(compare)
  })

  it("should return the null service", () => {
    const config = {
      "null_uri_prefix": "required",
    }
    const serviceName = "null"

    const provider = new FileServiceProvider(serviceName)
      .registerFileService("null", new NullFileService())
      .configure(config)

    expect(provider.activeFileService).toBeInstanceOf(NullFileService)
  })
})
