import { FormOption } from "@bloom-housing/doorway-ui-components"
import { CheckboxItem } from "@bloom-housing/ui-seeds/src/forms/CheckboxGroup"

// ie. [{label : "1" value: "1"}, {label : "2+" value: "2"} if includeMore is true
export const numericSearchFieldGenerator = (
  start: number,
  end: number,
  includeMore = true
): FormOption[] => {
  const fieldValues = []
  for (let i = start; i <= end; i++) {
    const numString = i.toString()
    fieldValues.push({
      label: i < end || !includeMore ? numString : `${numString}+`,
      value: numString,
    })
  }
  return fieldValues
}

export const getCheckboxValues = (formValues: string[]) => {
  return formValues.map((value) => ({ label: value, value: value }))
}

export const getFormValues = (checkboxValues: CheckboxItem[]) => {
  return checkboxValues.map((value) => value.value)
}
