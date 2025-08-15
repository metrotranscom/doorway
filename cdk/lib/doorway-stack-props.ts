import { StackProps } from "aws-cdk-lib"

export interface DoorwayStackProps extends StackProps {
  environment: string
}
