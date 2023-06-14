import { FileServiceInterface, FileServiceProvider } from "@bloom-housing/shared-services"
import axios from "axios"

const getAssetEndpointUrl = () => {
  return process.env.backendApiBase + "/assets"
}

const uploadAsset = async (data: FormData, onUploadProgress: (progress: number) => void) => {
  // init progress bar
  onUploadProgress(1)

  const uploadUrl = getAssetEndpointUrl() + "/upload"

  // send request to backend
  const response = await axios.request({
    method: "put",
    url: uploadUrl,
    data: data,
    onUploadProgress: (p) => {
      onUploadProgress(parseInt(((p.loaded / p.total) * 100).toFixed(0), 10))
    },
  })

  // show complete
  onUploadProgress(100)

  return response
}

const uploadAssetWithFileService = async (
  file: File,
  label: string,
  onUploadProgress: (progress: number) => void
) => {
  const fileService: FileServiceInterface = FileServiceProvider.getPublicUploadService()
  const generatedId = await fileService.putFile(label, file, onUploadProgress)

  // determine url function based on file type
  let url

  if (file.type.startsWith("image/")) {
    url = fileService.getDownloadUrlForPhoto(generatedId)
  } else if (file.type.startsWith("document/")) {
    url = fileService.getDownloadUrlForPdf(generatedId)
  }
  // shouldn't be anything but those 2 options, but otherwise just leave it null

  return {
    id: generatedId,
    url: url,
  }
}

export const uploadAssetAndSetData = async (
  file: File,
  label: string,
  setProgressValue: (value: React.SetStateAction<number>) => void,
  setAssetData: (data: { id: string; url: string }) => void
) => {
  const setProgressValueCallback = (value: number) => {
    setProgressValue(value)
  }

  const data = await uploadAssetWithFileService(file, label, setProgressValueCallback)

  setAssetData(data)
}
