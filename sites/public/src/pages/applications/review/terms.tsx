import React, { useContext, useEffect, useState } from "react"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"
import Markdown from "markdown-to-jsx"
import { t, Field, Form, AlertBox } from "@bloom-housing/ui-components"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import {
  OnClientSide,
  PageView,
  pushGtmEvent,
  AuthContext,
  listingSectionQuestions,
} from "@bloom-housing/shared-helpers"
import FormsLayout from "../../../layouts/forms"
import { useFormConductor } from "../../../lib/hooks"
import { UserStatus } from "../../../lib/constants"
import { untranslateMultiselectQuestion } from "../../../lib/helpers"
import {
  ApplicationReviewStatusEnum,
  MultiselectQuestionsApplicationSectionEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import ApplicationFormLayout from "../../../layouts/application-form"
import { Button } from "@bloom-housing/ui-seeds"

const ApplicationTerms = () => {
  const router = useRouter()
  const { conductor, application, listing } = useFormConductor("terms")
  const { applicationsService, profile } = useContext(AuthContext)
  const [apiError, setApiError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  let currentPageSection = 4
  if (listingSectionQuestions(listing, MultiselectQuestionsApplicationSectionEnum.programs)?.length)
    currentPageSection += 1
  if (
    listingSectionQuestions(listing, MultiselectQuestionsApplicationSectionEnum.preferences)?.length
  )
    currentPageSection += 1
  const applicationDueDate = new Date(listing?.applicationDueDate).toDateString()

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors } = useForm()
  const onSubmit = (data) => {
    setSubmitting(true)
    const acceptedTerms = data.agree
    conductor.currentStep.save({ acceptedTerms })
    application.acceptedTerms = acceptedTerms
    application.completedSections = 6

    if (application.programs?.length) {
      untranslateMultiselectQuestion(application.programs, listing)
    }
    if (application.preferences?.length) {
      untranslateMultiselectQuestion(application.preferences, listing)
    }

    if (application.demographics.spokenLanguage === "notListed") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      application.demographics.spokenLanguage = `${application.demographics.spokenLanguage}:${application.demographics.spokenLanguageNotListed}`
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete application.demographics.spokenLanguageNotListed

    applicationsService
      .submit({
        body: {
          ...application,
          reviewStatus: ApplicationReviewStatusEnum.pending,
          listings: {
            id: listing.id,
          },
          appUrl: window.location.origin,
          ...(profile && {
            user: {
              id: profile.id,
            },
          }),
          // TODO remove this once this call is changed to the new backend
        },
      })
      .then((result) => {
        conductor.currentStep.save({ confirmationCode: result.confirmationCode })
        return router.push("/applications/review/confirmation")
      })
      .catch((err) => {
        setSubmitting(false)
        setApiError(true)
        window.scrollTo(0, 0)
        console.error(`Error creating application: ${err}`)
        throw err
      })
  }

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Application - Terms",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  return (
    <FormsLayout>
      <Form id="review-terms" onSubmit={handleSubmit(onSubmit)}>
        <ApplicationFormLayout
          listingName={listing?.name}
          heading={t("application.review.terms.title")}
          progressNavProps={{
            currentPageSection: currentPageSection,
            completedSections: application.completedSections,
            labels: conductor.config.sections.map((label) => t(`t.${label}`)),
            mounted: OnClientSide(),
          }}
          backLink={{
            url: conductor.determinePreviousUrl(),
          }}
        >
          {apiError && (
            <AlertBox type="alert" inverted onClose={() => setApiError(false)}>
              {t("errors.alert.badRequest")}
            </AlertBox>
          )}

          <CardSection divider={"flush"} className={"border-none"}>
            <div className="markdown">
              {listing?.applicationDueDate && (
                <>
                  <Markdown options={{ disableParsingRawHTML: true }}>
                    {t("application.review.terms.textSubmissionDate", {
                      applicationDueDate: applicationDueDate,
                    })}
                  </Markdown>
                  <br />
                  <br />
                </>
              )}

              <Markdown
                options={{
                  overrides: {
                    li: {
                      component: ({ children, ...props }) => (
                        <li {...props} className="mb-5">
                          {children}
                        </li>
                      ),
                    },
                  },
                }}
              >
                {t("application.review.terms.text")}
              </Markdown>

              <div className="mt-6">
                <Field
                  id="agree"
                  name="agree"
                  type="checkbox"
                  label={t("application.review.terms.confirmCheckboxText")}
                  register={register}
                  validation={{ required: true }}
                  error={errors.agree}
                  errorMessage={t("errors.agreeError")}
                  dataTestId={"app-terms-agree"}
                />
              </div>
            </div>
          </CardSection>
          <CardSection className={"bg-primary-lighter"}>
            <Button
              loadingMessage={
                submitting ? t("application.review.terms.submittingApplication") : null
              }
              variant={"primary"}
              type="submit"
              id={"app-terms-submit-button"}
            >
              {t("t.submit")}
            </Button>
          </CardSection>
        </ApplicationFormLayout>
      </Form>
    </FormsLayout>
  )
}

export default ApplicationTerms
