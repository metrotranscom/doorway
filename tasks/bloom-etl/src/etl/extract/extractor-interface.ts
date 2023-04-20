import { Listing } from "../../types"
import { BaseStageInterface } from "../base-stage-interface"

export interface ExtractorInterface extends BaseStageInterface {
  extract(): Promise<Array<Listing>>
}
