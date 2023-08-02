import { FieldSingle } from "@bloom-housing/doorway-ui-components/src/forms/FieldGroup"

// ie. [{label : "1" value: "1"}, {label : "2+" value: "2"} if includeMore is true
export const numericSearchFieldGenerator = (
  start: number,
  end: number,
  includeMore = true
): FieldSingle[] => {
  const fieldValues = []
  for (let i = start; i <= end; i++) {
    const numString = i.toString()
    const labelId = i < end || !includeMore ? numString : `${numString}+`
    fieldValues.push({
      id: labelId,
      label: labelId,
      value: numString,
    })
  }
  return fieldValues
}
