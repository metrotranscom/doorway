import React from "react"
import "./DashBlocks.module.scss"

const DashBlocks = (props: { children: React.ReactNode }) => (
  <div className="dash-blocks">{props.children}</div>
)
export { DashBlocks as default, DashBlocks }
