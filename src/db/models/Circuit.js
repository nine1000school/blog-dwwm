import { Model } from "objection"
import Race from "./Race.js"

class Circuit extends Model {
  static tableName = "circuits"

  static get relationMappings() {
    return {
      races: {
        relation: Model.HasManyRelation,
        modelClass: Race,
        join: {
          from: "circuits.id",
          to: "races.circuitId",
        },
      }
    }
  }
}

export default Circuit 