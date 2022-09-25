import { Model } from "objection"
import Race from "./Race.js"
import Team from "./Team.js"

class Driver extends Model {
  static tableName = "drivers"

  static get relationMappings() {
    return {
      race: {
        relation: Model.BelongsToOneRelation,
        modelClass: Race,
        join: {
          from: "race.eventId",
          to: "events.id",
        }
      },
      team: {
        relation: Model.BelongsToOneRelation,
        modelClass: Team,
        join: {
          from: "drivers.id",
          to: "teams.driverId",
        }
      }
    }
  }
}

export default Driver