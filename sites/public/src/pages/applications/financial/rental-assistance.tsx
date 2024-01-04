/*
3.2 Additional Rental Assistance
Question asks if anyone on the application receives rental assistance.
*/
import React, { useContext, useEffect } from "react"
import { Form, t, FieldGroup } from "@bloom-housing/ui-components"
import FormsLayout from "../../../layouts/forms"
import { useForm } from "react-hook-form"
import { useFormConductor } from "../../../lib/hooks"
import { Alert } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import {
  OnClientSide,
  PageView,
  pushGtmEvent,
  AuthContext,
  listingSectionQuestions,
} from "@bloom-housing/shared-helpers"
import { UserStatus } from "../../../lib/constants"
import { ApplicationSection } from "@bloom-housing/backend-core"
import ApplicationFormLayout from "../../../layouts/application-form"
import styles from "../../../layouts/application-form.module.scss"

const ApplicationRentalAssistance = () => {
  const { profile } = useContext(AuthContext)
  const { conductor, application, listing } = useFormConductor("rentalAssistance")
  const currentPageSection = listingSectionQuestions(listing, ApplicationSection.programs)?.length
    ? 4
    : 3
  /* Form Handler */
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors, getValues } = useForm({
    defaultValues: {
      rentalAssistance: application.rentalAssistance?.toString(),
    },
    shouldFocusError: false,
  })

  const onSubmit = (data) => {
    const { rentalAssistance } = data
    const toSave = { rentalAssistance: JSON.parse(rentalAssistance) }

    conductor.currentStep.save(toSave)
    conductor.routeToNextOrReturnUrl()
  }
  const onError = () => {
    window.scrollTo(0, 0)
  }

  const rentalAssistanceValues = [
    {
      id: "rentalAssistanceYes",
      value: "true",
      label: t("t.yes"),
    },
    {
      id: "rentalAssistanceNo",
      value: "false",
      label: t("t.no"),
    },
  ]

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Application - Additional Rental Assistance",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  return (
    <FormsLayout>
      <Form onSubmit={handleSubmit(onSubmit, onError)}>
        <ApplicationFormLayout
          listingName={listing?.name}
          heading={t("application.financial.rentalAssistance.title")}
          subheading={
            <div>
              <p className="field-note mb-4">
                {t("application.financial.rentalAssistance.description")}
              </p>

              <p className="field-note">
                {t("application.financial.rentalAssistance.description2")}
              </p>
            </div>
          }
          progressNavProps={{
            currentPageSection: currentPageSection,
            completedSections: application.completedSections,
            labels: conductor.config.sections.map((label) => t(`t.${label}`)),
            mounted: OnClientSide(),
          }}
          backLink={{
            url: conductor.determinePreviousUrl(),
          }}
          conductor={conductor}
        >
          {Object.entries(errors).length > 0 && (
            <Alert
              className={styles["message-inside-card"]}
              variant="alert"
              fullwidth
              id={"application-alert-box"}
            >
              {t("errors.errorsToResolve")}
            </Alert>
          )}

          <CardSection divider={"flush"} className={"border-none"}>
            <fieldset>
              <legend className="text__caps-spaced">{t("t.selectOne")}</legend>
              <FieldGroup
                fieldGroupClassName="grid grid-cols-1"
                fieldClassName="ml-0"
                type="radio"
                name="rentalAssistance"
                groupNote={t("t.pleaseSelectOne")}
                error={errors.rentalAssistance}
                errorMessage={t("errors.selectAnOption")}
                register={register}
                fields={rentalAssistanceValues}
                dataTestId={"app-income-rental-assistance"}
                validation={{
                  validate: () => {
                    return !!Object.values(getValues()).filter((value) => value).length
                  },
                }}
              />
            </fieldset>
          </CardSection>
        </ApplicationFormLayout>
      </Form>
    </FormsLayout>
  )
}

export default ApplicationRentalAssistance
