import validate from "../middlewares/validate.js"
import {
  validateDisplayName,
  validateEmail,
  validateLimit,
  validateOffset,
  validatePassword,
  validateUsername,
} from "../validators.js"

const makeUsersRoutes = ({ app, db }) => {
  // CREATE
  app.post(
    "/users",
    validate({
      body: {
        email: validateEmail.required(),
        password: validatePassword.required(),
        username: validateUsername.required(),
        displayName: validateDisplayName.required(),
      },
    }),
    async (req, res) => {
      const { email, password, username, displayName } = req.body

      const [user] = await db("users")
        .insert({
          email,
          passwordHash: password, // TODO hash
          passwordSalt: password, // TODO hash
          username,
          displayName,
        })
        .returning("*")

      res.send(user) // TODO never send password, even hash!!!
    }
  )
  // READ collection
  app.get(
    "/users",
    validate({
      query: {
        offset: validateOffset,
        limit: validateLimit,
      },
    }),
    async (req, res) => {
      const { offset, limit } = req.query
      const users = await db("users")
        .limit(limit)
        .offset(offset * limit)

      res.send(users)
    }
  )
  app.get("/users/:userId", async (req, res) => {})
  app.patch("/users/:userId", async (req, res) => {})
  app.delete("/users/:userId", async (req, res) => {})
}

export default makeUsersRoutes
