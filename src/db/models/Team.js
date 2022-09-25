import { Model } from "objection"
import Driver from "./Driver.js"

class Team extends Model {
  static tableName = "teams"

  static get relationMappings() {
    return {
      driver: {
        relation: Model.HasManyRelation,
        modelClass: Driver,
        join: {
          from: "teams.id",
          to: "drivers.teamId",
        }
      }
    }
  }
}

export default Team