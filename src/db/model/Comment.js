import { Model } from "objection"
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
    }
  }
}

export default Comment
