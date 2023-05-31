import React from "react"

export type ButtonProps = {
  isActive: boolean
  index: number
  label: string
  value: string
  onSelect: (index: number) => void
  onDeselect: (index: number) => void
}

const buttonStyleBase: React.CSSProperties = {
  margin: "5px",
  padding: "5px 10px",
  display: "inline-block",
  borderRadius: "20px",
  textAlign: "center",
}

const buttonStyleInactive: React.CSSProperties = {
  ...buttonStyleBase,
  border: "1px solid var(--bloom-color-gray-500)",
}

const buttonStyleActive: React.CSSProperties = {
  ...buttonStyleBase,
  backgroundColor: "var(--bloom-color-blue-300)",
}

/**
 * A generic button that has an active (selected) and inactive (deselected) state
 *
 * @param props
 * @returns
 */
const Button = (props: ButtonProps) => {
  const toggleState = () => {
    if (!props.isActive) {
      props.onSelect(props.index)
    } else {
      props.onDeselect(props.index)
    }
  }

  const keyDownHandler = (event) => {
    // TODO: keyboard-based navigation?
    if (event.charCode == " ") {
      toggleState()
    }
  }

  let useStyle: React.CSSProperties = {}

  if (props.isActive) {
    useStyle = { ...buttonStyleActive }
  } else {
    useStyle = { ...buttonStyleInactive }
  }
  if (props.index == 0) {
    useStyle = { ...useStyle, ...{ margin: "5px 5px 5px 0" } }
  }

  return (
    <div
      role="button"
      style={useStyle}
      onClick={toggleState}
      onKeyDown={keyDownHandler}
      tabIndex={props.index}
    >
      &nbsp;{props.label}&nbsp;
    </div>
  )
}

export { Button as default, Button }
