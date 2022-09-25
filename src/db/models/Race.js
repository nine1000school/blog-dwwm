import { Model } from "objection"
import Circuit from "./Circuit.js"
import Comment from "./Comment.js"
import Driver from "./Driver.js"
import RaceEvent from "./RaceEvent.js"
import Season from "./Season.js"

class Race extends Model {
  static tableName = "races"

  static get relationMappings() {
    return {
      comments: {
        relation: Model.HasManyRelation,
        modelClass: Comment,
        join: {
          from: "races.id",
          to: "comments.raceId",
        },
      },
      season: {
        relation: Model.BelongsToOneRelation,
        modelClass: Season,
        join: {
          from: "season.raceId",
          to: "seasons.id",
        },
      },
      circuit: {
        relation: Model.BelongsToOneRelation,
        modelClass: Circuit,
        join: {
          from: "circuit.raceId",
          to: "circuits.id",
        }
      },
      driver: {
        relation: Model.HasManyRelation,
        modelClass: Driver,
        join: {
          from: "races.id",
          to: "drivers.raceId",
        }
      },
      event: {
        relation: Model.HasManyRelation,
        modelClass: RaceEvent,
        join: {
          from: "events.id",
          to: "events.raceId",
        }
      },
    }
  }
}

export default Race