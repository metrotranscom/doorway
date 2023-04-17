import axios from "axios"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

interface AwsS3UploadProps {
  client: S3Client
  file: File
  key: string
  onUploadProgress: (progress: number) => void
  bucketName: string
}

export const AwsS3Upload = async ({
  client,
  file,
  key,
  onUploadProgress,
  bucketName,
}: AwsS3UploadProps) => {
  const command = new PutObjectCommand({ Bucket: bucketName, Key: key })
  const url = await getSignedUrl(client, command, { expiresIn: 3600 })
  const data = new FormData()
  data.append("file", file)
  const response = await axios.request({
    method: "put",
    url: url,
    data: data,
    onUploadProgress: (p) => {
      onUploadProgress(parseInt(((p.loaded / p.total) * 100).toFixed(0), 10))
    },
  })
  return response
}
