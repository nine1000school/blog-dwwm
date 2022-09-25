import { Model } from "objection"
import Race from "./Race.js"
import User from "./User.js"

class Comment extends Model {
  static tableName = "comments"

  static get relationMappings() {
    return {
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "comments.userId",
          to: "users.id",
        },
      },
      race: {
        relation: Model.BelongsToOneRelation,
        modelClass: Race,
        join: {
          from: "race.commentId",
          to: "comments.id",
        },
      },
    }
  }
}

export default Comment