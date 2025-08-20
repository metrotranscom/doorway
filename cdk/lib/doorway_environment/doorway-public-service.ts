import { Construct } from "constructs"

import { DoorwayService } from "./doorway_services"
import { DoorwayServiceProps } from "./doorway-service-props"

export class DoorwayPublicService extends DoorwayService {
  constructor(scope: Construct, id: string, props: DoorwayServiceProps) {
    super(scope, id, props)
  }
}
