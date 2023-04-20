export interface FileServiceInterface {
  putFile(key: string, file: File, setProgressValue: (value: number) => void): Promise<string>
  getDownloadUrlForPhoto(id: string, size?: number): Promise<string>
  getDownloadUrlForPdf(id: string): Promise<string>
}
