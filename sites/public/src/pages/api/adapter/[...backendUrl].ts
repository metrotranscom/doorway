import axiosStatic from "axios"
import type { NextApiRequest, NextApiResponse } from "next"
import qs from "qs"
import { wrapper } from "axios-cookiejar-support"
import { CookieJar } from "tough-cookie"
import { getConfigs } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { logger } from "../../../logger"

/*
  This file exists as per https://nextjs.org/docs/api-routes/dynamic-api-routes
  it serves as an adapter between the front end making api requests and those requests being sent to the backend api
  This file functionally works as a proxy cd sto work in the new cookie paradigm
*/

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const jar = new CookieJar()
  const headers: Record<string, string | string[]> = {
    jurisdictionName: req.headers.jurisdictionname,
    language: req.headers.language,
    appUrl: req.headers.appurl,
    "x-forwarded-for": req.headers["x-forwarded-for"] || "",
  }

  if (process.env.API_PASS_KEY) {
    headers.passkey = process.env.API_PASS_KEY
  }
  const axios = wrapper(
    axiosStatic.create({
      baseURL: process.env.BACKEND_API_BASE,
      headers,
      paramsSerializer: (params) => {
        return qs.stringify(params)
      },
      jar,
    })
  )

  // eslint-disable-next-line prefer-const
  let { backendUrl, ...rest } = req.query
  if (Array.isArray(backendUrl)) {
    backendUrl = backendUrl.join("/")
  }

  try {
    // set up request to backend from request to next api
    const configs = getConfigs(req.method || "", "application/json", backendUrl || "", {})
    let cookieString = ""
    Object.keys(req.cookies).forEach((cookieHeader) => {
      cookieString += `${cookieHeader}=${req.cookies[cookieHeader]};`
    })
    configs.headers.cookie = cookieString
    configs.params = rest
    configs.data = req.body || {}

    // log that call is going out
    logger.info(`${req.method} - ${backendUrl}`)
    logger.debug(req)

    // send request to backend
    const response = await axios.request(configs)

    // set up response from next api based on response from backend
    const cookies = await jar.getSetCookieStrings(process.env.BACKEND_API_BASE || "")
    res.setHeader("Set-Cookie", cookies)
    res.statusMessage = response.statusText
    res.status(response.status).json(response.data)
  } catch (e) {
    if (e.response) {
      logger.error(
        `${req.method} - ${backendUrl} - ${e.response?.status} - ${e.response?.statusText}`
      )
      res.statusMessage = e.response.statusText
      res.status(e.response.status).json(e.response.data)
    } else {
      logger.error("public backend url adapter error:", e)
    }
  }
}
