import React, { useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { t, Select, FieldGroup } from "@bloom-housing/ui-components"
import { Grid } from "@bloom-housing/ui-seeds"
import {
  raceKeys,
  spokenLanguageKeys,
  genderKeys,
  sexualOrientationKeys,
} from "@bloom-housing/shared-helpers"
import { Demographics } from "@bloom-housing/backend-core/types"
import SectionWithGrid from "../../../shared/SectionWithGrid"

type FormDemographicsProps = {
  formValues: Demographics
}

const FormDemographics = ({ formValues }: FormDemographicsProps) => {
  const formMethods = useFormContext()

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register } = formMethods

  // Does a key exist in a root field or a sub array
  const isKeyIncluded = (raceKey: string) => {
    let keyExists = false
    formValues?.race?.forEach((value) => {
      if (value.includes(raceKey)) {
        keyExists = true
      }
    })
    return keyExists
  }

  // Get the value of a field that is storing a custom value, i.e. "otherAsian: Custom Race Input"
  const getCustomValue = (subKey: string) => {
    const customValues = formValues?.race?.filter((value) => value.split(":")[0] === subKey)
    return customValues?.length ? customValues[0].split(":")[1]?.substring(1) : ""
  }

  const raceOptions = useMemo(() => {
    return Object.keys(raceKeys).map((rootKey) => ({
      id: rootKey,
      label: t(`application.review.demographics.raceOptions.${rootKey}`),
      value: rootKey,
      additionalText: rootKey.indexOf("other") >= 0,
      defaultChecked: isKeyIncluded(rootKey),
      defaultText: getCustomValue(rootKey),
      subFields: raceKeys[rootKey].map((subKey) => ({
        id: subKey,
        label: t(`application.review.demographics.raceOptions.${subKey}`),
        value: subKey,
        defaultChecked: isKeyIncluded(subKey),
        additionalText: subKey.indexOf("other") >= 0,
        defaultText: getCustomValue(subKey),
      })),
    }))
  }, [register, isKeyIncluded, getCustomValue])

  return (
    <>
      <hr className="spacer-section-above spacer-section" />
      <SectionWithGrid heading={t("application.add.demographicsInformation")}>
        <Grid.Row>
          <Grid.Cell>
            <FieldGroup
              name="race"
              fields={raceOptions}
              type="checkbox"
              register={register}
              groupLabel={t("application.add.race")}
            />
          </Grid.Cell>
          <Grid.Cell>
            <Select
              id="application.demographics.spokenLanguage"
              name="application.demographics.spokenLanguage"
              placeholder={t("t.selectOne")}
              label={t("application.add.spokenLanguage")}
              register={register}
              controlClassName="control"
              options={spokenLanguageKeys}
              keyPrefix="application.review.demographics.spokenLanguageOptions"
            />

            <Select
              id="application.demographics.gender"
              name="application.demographics.gender"
              placeholder={t("t.selectOne")}
              label={t("application.add.gender")}
              register={register}
              controlClassName="control"
              options={genderKeys}
              keyPrefix="application.review.demographics.genderOptions"
            />

            <Select
              id="application.demographics.sexualOrientation"
              name="application.demographics.sexualOrientation"
              placeholder={t("t.selectOne")}
              label={t("application.add.sexualOrientation")}
              register={register}
              controlClassName="control"
              options={sexualOrientationKeys}
              keyPrefix="application.review.demographics.sexualOrientationOptions"
            />
          </Grid.Cell>
        </Grid.Row>
      </SectionWithGrid>
    </>
  )
}

export { FormDemographics as default, FormDemographics }
