import { Test, TestingModule } from "@nestjs/testing"
import { AwsS3FileUploader } from "./aws-s3-file-uploader"
import { AwsS3FileService } from "./aws-s3-file.service"
import { S3Client } from "@aws-sdk/client-s3"
import { AwsS3FileServiceConfig } from "./file-service-config"

// Cypress brings in Chai types for the global expect, but we want to use jest
// expect here so we need to re-declare it.
// see: https://github.com/cypress-io/cypress/issues/1319#issuecomment-593500345
declare const expect: jest.Expect

let service: AwsS3FileService
const awsS3FileUploaderMock = {
  uploadAwsS3File: () => {
    return new Promise(function (resolve) {
      resolve("fileId")
    })
  },
}
const s3ClientMock = jest.fn()
const awsS3FileServiceConfig: AwsS3FileServiceConfig = {
  bucketName: "test",
}

describe("AwsS3FileService", () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AwsS3FileService,
        {
          provide: AwsS3FileUploader,
          useValue: awsS3FileUploaderMock,
        },
        {
          provide: AwsS3FileServiceConfig,
          useValue: awsS3FileServiceConfig,
        },
        {
          provide: S3Client,
          useValue: s3ClientMock,
        },
      ],
    }).compile()
    service = await module.resolve(AwsS3FileService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  it("should return id for putFile", async () => {
    const callbackFn = (value: number) => {
      return value + 1
    }
    const id = await service.putFile("file", new File(["content"], "filename"), callbackFn)
    const expectedId = "fileId"
    expect(id).toEqual(expectedId)
  })
})
