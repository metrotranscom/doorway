// ie. [{label : "1" value: "1"}, {label : "2+" value: "2"} if includeMore is true
export const numericSearchFieldGenerator = (start: number, end: number, includeMore = true) => {
  const fieldValues = []
  for (let i = start; i <= end; i++) {
    const numString = i.toString()
    if (i < start || !includeMore) {
      fieldValues.push({
        label: numString,
        value: numString,
      })
    } else {
      fieldValues.push({
        label: `${numString}+`,
        value: numString,
      })
    }
  }
  return fieldValues
}
