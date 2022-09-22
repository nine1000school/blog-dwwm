import { Model } from "objection"
import hashPassword from "../../hashPassword.js"
import Post from "./Post.js"

class User extends Model {
  static tableName = "users"

  static get relationMappings() {
    return {
      posts: {
        relation: Model.HasManyRelation,
        modelClass: Post,
        join: {
          from: "users.id",
          to: "posts.userId",
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
