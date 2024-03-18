import { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { Heading, HeadingGroup, Icon } from "@bloom-housing/ui-seeds"
import Card from "@bloom-housing/ui-seeds/src/blocks/Card"
import React from "react"
import styles from "./AccountCard.module.scss"
import { CustomIconMap, CustomIconType } from "./CustomIconMap"

interface AccountCardProps {
  customIcon?: CustomIconType
  standardIcon?: IconDefinition
  title: string
  subtitle?: string
  children: React.ReactElement
  id?: string
  divider?: "flush" | "inset"
  headingPriority?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
  iconClassName?: string
  thinDesktop?: boolean
  thinMobile?: boolean
}

const AccountCard = (props: AccountCardProps) => {
  const classNames = [styles["account-card"]]
  if (props.className) classNames.push(props.className)
  if (!props.thinDesktop) classNames.push(styles["account-card-inline-desktop"])
  if (props.thinMobile) classNames.push(styles["account-card-inline-mobile"])

  const iconClassNames = [styles["account-card-icon"]]
  if (props.iconClassName) iconClassNames.push(props.iconClassName)

  return (
    <Card spacing="lg" className={classNames.join(" ")}>
      <Card.Header divider={props?.divider}>
        {props?.customIcon ? (
          <Icon size="2xl" className={iconClassNames.join(" ")}>
            {CustomIconMap[props?.customIcon]}
          </Icon>
        ) : (
          <Icon size="2xl" icon={props?.standardIcon} className={iconClassNames.join(" ")} />
        )}
        {props.subtitle ? (
          <HeadingGroup
            size="2xl"
            heading={
              <Heading size="2xl" className={styles["account-card-heading"]}>
                {props.title}
              </Heading>
            }
            subheading={props.subtitle}
            className={styles["account-card-heading-group"]}
            headingPriority={props.headingPriority}
          />
        ) : (
          <Heading size="2xl" className={styles["account-card-heading"]}>
            {props.title}
          </Heading>
        )}
      </Card.Header>
      {props.children}
    </Card>
  )
}

export { AccountCard as default, AccountCard }
