import { Model } from "objection"
import User from "./User.js"

class Post extends Model {
  static tableName = "posts"

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "posts.userId",
          to: "users.id",
        },
      },
    }
  }
}

export default Post
