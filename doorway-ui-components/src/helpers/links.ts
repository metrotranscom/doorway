import _ from "lodash"
export const isExternalLink = (href: string) => {
  return href.startsWith("http://") || href.startsWith("https://")
}

export const isInternalLink = (href: string) => {
  return href.startsWith("/") && !href.startsWith("//")
}

export interface JumplinkData {
  title: string
  // Warning -- id_override does not namespace the id by default
  // (see generateJumplinkId for more information)
  id_override?: string
}

// HTML ids are global, singletons, and turn into window object keys, so
// we namespace here to avoid accidental collisions.
export const generateJumplinkId = (data: JumplinkData) => {
  return data.id_override ? data.id_override : `${_.kebabCase(data.title)}-section`
}
