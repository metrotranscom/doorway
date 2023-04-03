import { Test, TestingModule } from "@nestjs/testing"
import { CloudinaryFileService } from "./cloudinary-file.service"

// Cypress brings in Chai types for the global expect, but we want to use jest
// expect here so we need to re-declare it.
// see: https://github.com/cypress-io/cypress/issues/1319#issuecomment-593500345
declare const expect: jest.Expect

let service: CloudinaryFileService

describe("CloudinaryFileService", () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryFileService],
    }).compile()
    service = await module.resolve(CloudinaryFileService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
