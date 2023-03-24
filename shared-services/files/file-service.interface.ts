import { SetStateAction } from "react"

interface FileServiceInterface {
  putFile(
    key: string,
    file: File,
    setProgressValue: (value: SetStateAction<number>) => void
  ): Promise<string>
  getDownloadUrlForPhoto(id: string): string
  getDownloadUrlForPdf(id: string): string
}
