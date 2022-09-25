import { Model } from "objection"
import Race from "./Race.js"

class RaceEvent extends Model {
  static tableName = "events"

  static get relationMappings() {
    return {
      race: {
        relation: Model.HasOneRelation,
        modelClass: Race,
        join: {
          from: "events.id",
          to: "races.eventId",
        }
      }
    }
  }
}

export default RaceEvent