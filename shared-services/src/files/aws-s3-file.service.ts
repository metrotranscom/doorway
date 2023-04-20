import { Injectable } from "@nestjs/common"
import { AwsS3FileUploader } from "./aws-s3-file-uploader"
import { AwsS3FileServiceConfig } from "./file-service-config"
import { FileServiceInterface } from "./file-service.interface"
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

@Injectable()
export class AwsS3FileService implements FileServiceInterface {
  constructor(
    private readonly awsS3FileUploader: AwsS3FileUploader,
    private readonly awsS3FileServiceConfig: AwsS3FileServiceConfig,
    private readonly s3Client: S3Client
  ) {}

  async putFile(
    key: string,
    file: File,
    setProgressValue: (value: number) => void
  ): Promise<string> {
    const id = await this.awsS3FileUploader.uploadAwsS3File(
      this.s3Client,
      file,
      setProgressValue,
      this.awsS3FileServiceConfig.bucketName
    )
    return id
  }
  async getDownloadUrlForPhoto(id: string): Promise<string> {
    const getObjectCommand = new GetObjectCommand({
      Bucket: this.awsS3FileServiceConfig.bucketName,
      Key: id,
    })
    return await getSignedUrl(this.s3Client, getObjectCommand, { expiresIn: 3600 })
  }
  async getDownloadUrlForPdf(id: string): Promise<string> {
    // There is no difference in the logic for retrieving pictures and pdfs in S3
    return this.getDownloadUrlForPhoto(id)
  }
}
