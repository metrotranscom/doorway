/*
5.5 View
Optional application summary
*/
import React, { useContext, useEffect } from "react"
import FormsLayout from "../../layouts/forms"
import { AppSubmissionContext } from "../../lib/applications/AppSubmissionContext"
import { UserStatus } from "../../lib/constants"
import { pushGtmEvent, PageView, AuthContext } from "@bloom-housing/shared-helpers"
import { SubmittedApplicationView } from "../../components/applications/SubmittedApplicationView"

const ApplicationView = () => {
  const { application, listing } = useContext(AppSubmissionContext)
  const { profile } = useContext(AuthContext)

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Application - Optional Summary",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  return (
    <FormsLayout>
      <SubmittedApplicationView
        application={application}
        listing={listing}
        backHref={"/applications/review/confirmation"}
      ></SubmittedApplicationView>
    </FormsLayout>
  )
}

export default ApplicationView
