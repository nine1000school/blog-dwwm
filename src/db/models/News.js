import { Model } from "objection"
import Team from "./Team.js"

class News extends Model {
  static tableName = "news"

  static get relationMappings() {
    return {
      team: {
        relation: Model.BelongsToOneRelation,
        modelClass: Team,
        join: {
          from: "news.teamId",
          to: "teams.id",
        },
      },
    }
  }
}

export default News
