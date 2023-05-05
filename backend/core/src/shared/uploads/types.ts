import { Readable } from "stream";

export interface FileUpload {
  name: string;
  contentType: string;
  size: number;
  contents: Readable
}

export type FileServiceConfig = Record<string, string>

export interface FileUploadResult {
  id: string
  url: string
}
