export enum FileServiceTypeEnum {
  cloudinary = "cloudinary",
}

export class CloudinaryConfig {
  cloudinaryCloudName: string
}

export class FileConfig {
  fileServiceType: FileServiceTypeEnum
  cloudinaryConfig: CloudinaryConfig
}
