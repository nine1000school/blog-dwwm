import { Model } from "objection"
import Race from "./Race.js"

class Season extends Model {
  static tableName = "seasons"

  static get relationMappings() {
    return {
      race: {
        relation: Model.HasManyRelation,
        modelClass: Race,
        join: {
          from: "seasons.id",
          to: "races.seasonId",
        },
      }
    }
  }
}

export default Season 