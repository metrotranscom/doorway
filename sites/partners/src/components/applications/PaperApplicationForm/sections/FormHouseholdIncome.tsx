import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { FieldValue, Grid } from "@bloom-housing/ui-seeds"
import { useFormContext } from "react-hook-form"
import { IncomePeriod } from "@bloom-housing/backend-core/types"
import { YesNoAnswer } from "../../../../lib/helpers"
import SectionWithGrid from "../../../shared/SectionWithGrid"

const FormHouseholdIncome = () => {
  const formMethods = useFormContext()

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, setValue, watch } = formMethods

  const incomePeriodValue: string = watch("application.incomePeriod")

  return (
    <>
      <hr className="spacer-section-above spacer-section" />
      <SectionWithGrid heading={t("application.details.householdIncome")}>
        <Grid.Row>
          <FieldValue label={t("application.add.incomePeriod")}>
            <div className="flex h-12 items-center">
              <Field
                id="application.incomePeriodYear"
                name="application.incomePeriod"
                className="m-0"
                type="radio"
                label={t("t.perYear")}
                register={register}
                inputProps={{
                  value: IncomePeriod.perYear,
                  onChange: () => {
                    setValue("incomeMonth", "")
                    setValue("incomeYear", "")
                  },
                }}
              />

              <Field
                id="application.incomePeriodMonth"
                name="application.incomePeriod"
                className="m-0"
                type="radio"
                label={t("t.perMonth")}
                register={register}
                inputProps={{
                  value: IncomePeriod.perMonth,
                  onChange: () => {
                    setValue("incomeMonth", "")
                    setValue("incomeYear", "")
                  },
                }}
              />
            </div>
          </FieldValue>
        </Grid.Row>

        <Grid.Row>
          <Grid.Cell>
            <Field
              id="incomeYear"
              type="number"
              name="incomeYear"
              label={t("application.details.annualIncome")}
              placeholder={t("t.enterAmount")}
              register={register}
              disabled={incomePeriodValue !== IncomePeriod.perYear}
            />
          </Grid.Cell>

          <Grid.Cell>
            <Field
              id="incomeMonth"
              type="number"
              name="incomeMonth"
              label={t("application.details.monthlyIncome")}
              placeholder={t("t.enterAmount")}
              register={register}
              disabled={incomePeriodValue !== IncomePeriod.perMonth}
            />
          </Grid.Cell>

          <FieldValue label={t("application.details.vouchers")}>
            <div className="flex h-12 items-center">
              <Field
                id="application.incomeVouchersYes"
                name="application.incomeVouchers"
                className="m-0"
                type="radio"
                label={t("t.yes")}
                register={register}
                inputProps={{
                  value: YesNoAnswer.Yes,
                }}
              />

              <Field
                id="application.householdExpectingChangesNo"
                name="application.incomeVouchers"
                className="m-0"
                type="radio"
                label={t("t.no")}
                register={register}
                inputProps={{
                  value: YesNoAnswer.No,
                }}
              />
            </div>
          </FieldValue>

          <FieldValue label={t("application.details.rentalAssistance")}>
            <div className="flex h-12 items-center">
              <Field
                id="application.rentalAssistanceYes"
                name="application.rentalAssistance"
                className="m-0"
                type="radio"
                label={t("t.yes")}
                register={register}
                inputProps={{
                  value: YesNoAnswer.Yes,
                }}
              />

              <Field
                id="application.rentalAssistanceNo"
                name="application.rentalAssistance"
                className="m-0"
                type="radio"
                label={t("t.no")}
                register={register}
                inputProps={{
                  value: YesNoAnswer.No,
                }}
              />
            </div>
          </FieldValue>
        </Grid.Row>
      </SectionWithGrid>
    </>
  )
}

export { FormHouseholdIncome as default, FormHouseholdIncome }
