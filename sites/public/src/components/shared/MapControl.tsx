import React from "react"
import PlusIcon from "@heroicons/react/24/solid/PlusIcon"
import MinusIcon from "@heroicons/react/24/solid/MinusIcon"
import { Icon } from "@bloom-housing/ui-seeds"
import styles from "./MapControl.module.scss"
import { t } from "@bloom-housing/ui-components"

export interface MapControlProps {
  zoom: number
  setZoom: (value: React.SetStateAction<number>) => void
}

const MapControlZoomIn = (props: MapControlProps) => {
  const click = () => {
    props.setZoom(props.zoom + 1)
  }
  return (
    <button
      className={`${styles["control-style"]} ${styles["in-style"]}`}
      onClick={click}
      aria-label={t("t.zoomIn")}
    >
      <Icon size="lg" className={styles["control-icon"]}>
        <PlusIcon />
      </Icon>
    </button>
  )
}

const MapControlZoomOut = (props: MapControlProps) => {
  const click = () => {
    props.setZoom(props.zoom - 1)
  }

  return (
    <button
      className={`${styles["control-style"]} ${styles["out-style"]}`}
      onClick={click}
      aria-label={t("t.zoomOut")}
    >
      <Icon size="lg" className={styles["control-icon"]}>
        <MinusIcon />
      </Icon>
    </button>
  )
}

const MapControl = (props: MapControlProps) => {
  return (
    <div aria-label={t("t.mapControls")} role="group" className={styles["map-control"]}>
      <MapControlZoomIn zoom={props.zoom} setZoom={props.setZoom} />
      <MapControlZoomOut zoom={props.zoom} setZoom={props.setZoom} />
    </div>
  )
}

export { MapControl as default, MapControl }
