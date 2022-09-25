import { Model } from "objection"
import hashPassword from "../../hashPassword.js"
import Comment from "./Comment.js"

class User extends Model {
  static tableName = "users"

  static get relationMappings() {
    return {
      comments: {
        relation: Model.HasManyRelation,
        modelClass: Comment,
        join: {
          from: "users.id",
          to: "comments.userId",
        },
      },
    }
  }

  checkPassword(password) {
    const [passwordHash] = hashPassword(password, this.passwordSalt)

    return this.passwordHash === passwordHash
  }
}

export default User