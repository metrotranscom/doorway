import React from "react"
import MaskedInput from "react-text-mask"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PhoneMask = React.forwardRef((props: any, ref: any) => {
  const { value, onChange, name, disabled, placeholder } = props

  return (
    <>
      <MaskedInput
        mask={["(", /[1-9]/, /\d/, /\d/, ")", " ", /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, /\d/]}
        className="input"
        type="tel"
        placeholder={placeholder || "(555) 555-5555"}
        guide={false}
        id={name}
        value={value}
        name={name}
        disabled={disabled}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => {
          e.persist()
          onChange(e)
        }}
        ref={ref}
        aria-labelledby={"phone-label"}
      />
    </>
  )
})
