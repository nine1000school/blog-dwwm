import validate from "../middlewares/validate.js"
import {
  validateDisplayName,
  validateEmail,
  validatePassword,
  validateUsername,
} from "../validators.js"

const makeUsersRoutes = ({ app, db }) => {
  app.post(
    "/users",
    validate({
      email: validateEmail.required(),
      password: validatePassword.required(),
      username: validateUsername.required(),
      displayName: validateDisplayName.required(),
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
  app.get("/users", async (req, res) => {})
  app.get("/users/:userId", async (req, res) => {})
  app.patch("/users", async (req, res) => {})
  app.delete("/users", async (req, res) => {})
}

export default makeUsersRoutes
