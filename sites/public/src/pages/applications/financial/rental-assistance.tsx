/*
3.2 Additional Rental Assistance
Question asks if anyone on the application receives rental assistance.
*/
import React, { useContext, useEffect } from "react"
import {
  AppearanceStyleType,
  AlertBox,
  Button,
  Form,
  FormCard,
  t,
  ProgressNav,
  FieldGroup,
  Heading,
} from "@bloom-housing/ui-components"
import FormsLayout from "../../../layouts/forms"
import { useForm } from "react-hook-form"
import FormBackLink from "../../../components/applications/FormBackLink"
import { useFormConductor } from "../../../lib/hooks"
import {
  OnClientSide,
  PageView,
  pushGtmEvent,
  AuthContext,
  listingSectionQuestions,
} from "@bloom-housing/shared-helpers"
import { UserStatus } from "../../../lib/constants"
import { ApplicationSection } from "@bloom-housing/backend-core"

const ApplicationVouchers = () => {
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
      <FormCard header={<Heading priority={1}>{listing?.name}</Heading>}>
        <ProgressNav
          currentPageSection={currentPageSection}
          completedSections={application.completedSections}
          labels={conductor.config.sections.map((label) => t(`t.${label}`))}
          mounted={OnClientSide()}
        />
      </FormCard>
      <FormCard>
        <FormBackLink
          url={conductor.determinePreviousUrl()}
          onClick={() => conductor.setNavigatedBack(true)}
        />

        <div className="form-card__lead border-b">
          <h2 className="form-card__title is-borderless">
            {t("application.financial.rentalAssistance.title")}
          </h2>

          <p className="field-note mb-4 mt-5">
            ${t("application.financial.rentalAssistance.description")}
          </p>

          <p className="field-note">${t("application.financial.rentalAssistance.description2")}</p>
        </div>

        {Object.entries(errors).length > 0 && (
          <AlertBox type="alert" inverted closeable>
            {t("errors.errorsToResolve")}
          </AlertBox>
        )}

        <Form onSubmit={handleSubmit(onSubmit, onError)}>
          <div
            className={`form-card__group field text-xl ${errors.rentalAssistance ? "error" : ""}`}
          >
            <fieldset>
              <legend className="text__caps-spaced">{t("t.selectOne")}</legend>
              <FieldGroup
                fieldGroupClassName="grid grid-cols-1"
                fieldClassName="ml-0"
                type="radio"
                name="rentalAssistance"
                error={errors.rentalAssistance}
                errorMessage={t("errors.selectAnOption")}
                register={register}
                fields={rentalAssistanceValues}
                dataTestId={"app-income-vouchers"}
                validation={{
                  validate: () => {
                    return !!Object.values(getValues()).filter((value) => value).length
                  },
                }}
              />
            </fieldset>
          </div>

          <div className="form-card__pager">
            <div className="form-card__pager-row primary">
              <Button
                styleType={AppearanceStyleType.primary}
                onClick={() => conductor.setNavigatedBack(false)}
                data-testid={"app-next-step-button"}
              >
                {t("t.next")}
              </Button>
            </div>
          </div>
        </Form>
      </FormCard>
    </FormsLayout>
  )
}

export default ApplicationVouchers
