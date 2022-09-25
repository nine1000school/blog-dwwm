import { Model } from "objection"
import Race from "./Race.js"

class RaceEvent extends Model {
  static tableName = "events"

  static get relationMappings() {
    return {
      race: {
        relation: Model.BelongsToOneRelation,
        modelClass: Race,
        join: {
          from: "events.raceId",
          to: "events.id",
        }
      }
    }
  }
}

export default RaceEvent