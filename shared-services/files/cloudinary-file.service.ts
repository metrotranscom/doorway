import { SetStateAction } from "react"
import { cloudinaryPdfFromId, cloudinaryUrlFromId } from "@bloom-housing/shared-helpers"
import { cloudinaryFileUploader } from "../../sites/partners/src/lib/helpers"

class CloudinaryFileService implements FileServiceInterface {
  async putFile(
    key: string,
    file: File,
    setProgressValue: (value: SetStateAction<number>) => void
  ): Promise<string> {
    const id = await cloudinaryFileUploader({ file, setProgressValue })
    return id
  }
  getDownloadUrlForPhoto(id: string): string {
    return cloudinaryUrlFromId(id)
  }
  getDownloadUrlForPdf(id: string): string {
    return cloudinaryPdfFromId(id)
  }
}
