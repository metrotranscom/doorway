import React from "react"
import {
  t,
  Select,
  TimeField,
  DateField,
  DateFieldValues,
  Field,
} from "@bloom-housing/ui-components"
import { Grid } from "@bloom-housing/ui-seeds"
import {
  ApplicationSubmissionTypeEnum,
  LanguagesEnum,
  ApplicationStatusEnum,
  ReviewOrderTypeEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { useFormContext } from "react-hook-form"
import SectionWithGrid from "../../../shared/SectionWithGrid"

type FormApplicationDataProps = {
  appType: ApplicationSubmissionTypeEnum
  enableApplicationStatus: boolean
  reviewOrderType?: ReviewOrderTypeEnum
}

const FormApplicationData = ({
  enableApplicationStatus,
  appType,
  reviewOrderType,
}: FormApplicationDataProps) => {
  const formMethods = useFormContext()

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, watch, errors, setValue } = formMethods

  const dateSubmittedValue: DateFieldValues = watch("dateSubmitted")
  const isDateFilled =
    dateSubmittedValue?.day && dateSubmittedValue?.month && dateSubmittedValue?.year

  const isDateRequired =
    dateSubmittedValue?.day || dateSubmittedValue?.month || dateSubmittedValue?.year

  const dateReceivedValue: DateFieldValues = watch("dateReceived")
  const isDateReceivedFilled =
    dateReceivedValue?.day && dateReceivedValue?.month && dateReceivedValue?.year
  const isDateReceivedRequired =
    dateReceivedValue?.day && dateReceivedValue?.month && dateReceivedValue?.year

  const applicationStatus: ApplicationStatusEnum = watch("application.status")

  const accessibleUnitWaitlistNumberValue = watch("application.accessibleUnitWaitlistNumber")
  const conventionalUnitWaitlistNumberValue = watch("application.conventionalUnitWaitlistNumber")

  const isWaitlistStatus =
    applicationStatus === ApplicationStatusEnum.waitlist ||
    applicationStatus === ApplicationStatusEnum.waitlistDeclined

  const applicationStatusOptions = Array.from(Object.values(ApplicationStatusEnum))
  return (
    <SectionWithGrid heading={t("application.details.applicationData")}>
      <Grid.Row>
        <Grid.Cell>
          <DateField
            id="dateSubmitted"
            name="dateSubmitted"
            register={register}
            error={errors?.dateSubmitted}
            watch={watch}
            setValue={setValue}
            label={t("application.add.dateSubmitted")}
            errorMessage={t("errors.dateError")}
            required={!!isDateRequired}
            labelClass={"text__caps-spaced"}
            dataTestId="dateSubmitted"
          />
        </Grid.Cell>

        <Grid.Cell>
          <TimeField
            id="timeSubmitted"
            name="timeSubmitted"
            label={t("application.add.timeSubmitted")}
            register={register}
            setValue={setValue}
            watch={watch}
            error={!!errors?.timeSubmitted}
            disabled={!isDateFilled}
            required={!!isDateFilled}
            labelClass={"text__caps-spaced"}
            dataTestId="timeSubmitted"
          />
        </Grid.Cell>

        <Grid.Cell>
          <Select
            id="application.language"
            name="application.language"
            label={t("application.add.languageSubmittedIn")}
            register={register}
            controlClassName="control"
            options={["", ...Object.values(LanguagesEnum)]}
            keyPrefix="languages"
          />
        </Grid.Cell>
      </Grid.Row>

      {appType !== ApplicationSubmissionTypeEnum.electronical && (
        <Grid.Row>
          <Grid.Cell>
            <DateField
              id="dateReceived"
              name="dateReceived"
              register={register}
              error={errors?.dateReceived}
              watch={watch}
              label={t("application.add.dateReceivedAt")}
              errorMessage={t("errors.dateError")}
              required={!!isDateReceivedRequired}
              labelClass={"text__caps-spaced"}
            />
          </Grid.Cell>

          <Grid.Cell>
            <TimeField
              id="timeReceived"
              name="timeReceived"
              label={t("application.add.timeReceivedAt")}
              register={register}
              watch={watch}
              error={!!errors?.timeReceived}
              disabled={!isDateReceivedFilled}
              required={!!isDateReceivedFilled}
              labelClass={"text__caps-spaced"}
            />
          </Grid.Cell>

          <Grid.Cell>
            <Field
              id="application.receivedBy"
              name="application.receivedBy"
              label={t("application.add.receivedBy")}
              placeholder={t("application.add.receivedBy")}
              register={register}
            />
          </Grid.Cell>
        </Grid.Row>
      )}
      {enableApplicationStatus && (
        <>
          <Grid.Row columns={3}>
            <Grid.Cell>
              <Select
                id="application.status"
                name="application.status"
                label={t("application.details.applicationStatus")}
                register={register}
                controlClassName="control"
                options={applicationStatusOptions}
                keyPrefix="application.details.applicationStatus"
              />
            </Grid.Cell>
          </Grid.Row>
          <Grid.Row columns={3}>
            {/* We need active hidden field to send value even when field is not visible and disabled */}
            <Grid.Cell
              className={isWaitlistStatus || accessibleUnitWaitlistNumberValue ? "" : "hidden"}
            >
              <Field
                className={isWaitlistStatus ? "" : "hidden"}
                type="number"
                id="application.accessibleUnitWaitlistNumber"
                name="application.accessibleUnitWaitlistNumber"
                label={t("application.details.accessibleUnitWaitlistNumber")}
                register={register}
                error={!!errors?.application?.accessibleUnitWaitlistNumber}
              />
              {!isWaitlistStatus && (
                <Field
                  type="number"
                  name="application.accessibleUnitWaitlistNumber"
                  label={t("application.details.accessibleUnitWaitlistNumber")}
                  inputProps={{
                    value: accessibleUnitWaitlistNumberValue,
                  }}
                  disabled
                />
              )}
            </Grid.Cell>
            {/* We need active hidden field to send value even when field is not visible and disabled */}
            <Grid.Cell
              className={isWaitlistStatus || conventionalUnitWaitlistNumberValue ? "" : "hidden"}
            >
              <Field
                className={isWaitlistStatus ? "" : "hidden"}
                type="number"
                id="application.conventionalUnitWaitlistNumber"
                name="application.conventionalUnitWaitlistNumber"
                label={t("application.details.conventionalUnitWaitlistNumber")}
                register={register}
                error={!!errors?.application?.conventionalUnitWaitlistNumber}
              />
              {!isWaitlistStatus && (
                <Field
                  type="number"
                  name="application.conventionalUnitWaitlistNumber"
                  label={t("application.details.conventionalUnitWaitlistNumber")}
                  inputProps={{
                    value: conventionalUnitWaitlistNumberValue,
                  }}
                  disabled
                />
              )}
            </Grid.Cell>
            {reviewOrderType === ReviewOrderTypeEnum.lottery && (
              <Grid.Cell>
                <Field
                  type="number"
                  id="application.manualLotteryPositionNumber"
                  name="application.manualLotteryPositionNumber"
                  label={t("application.details.manualLotteryPositionNumber")}
                  register={register}
                  error={!!errors?.application?.manualLotteryPositionNumber}
                />
              </Grid.Cell>
            )}
          </Grid.Row>
        </>
      )}
    </SectionWithGrid>
  )
}

export { FormApplicationData as default, FormApplicationData }
