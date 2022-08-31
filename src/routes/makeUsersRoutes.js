import validate from "../middlewares/validate.js"
import {
  validateDisplayName,
  validateEmail,
  validateId,
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
      const { email, username, password, displayName } = req.body

      try {
        const [user] = await db("users")
          .insert({
            email,
            username,
            displayName,
            passwordHash: password,
            passwordSalt: password,
          })
          .returning("*")

        res.send({ result: user, count: 1 })
      } catch (err) {
        if (err.code === "23505") {
          res.status(409).send({
            error: [
              `Duplicated entry for: "${
                err.constraint.split("_").slice(-2, -1)[0]
              }"`,
            ],
          })

          return
        }

        // eslint-disable-next-line no-console
        console.error(err)

        res.status(500).send({ error: ["Something went wrong."] })
      }
    }
  )
  // READ collection
  app.get(
    "/users",
    validate({
      query: {
        limit: validateLimit,
        offset: validateOffset,
      },
    }),
    async (req, res) => {
      const { limit, offset } = req.query
      const [{ count }] = await db("users").count()
      const result = await db("users").limit(limit).offset(offset)

      res.send({ result, count: Number(count) })
    }
  )
  // READ single
  app.get(
    "/users/:userId",
    validate({
      params: {
        userId: validateId.required(),
      },
    }),
    async (req, res) => {
      const { userId } = req.params

      const [user] = await db("users").where({ id: userId })

      if (!user) {
        res.status(404).send({ error: ["User not found."] })

        return
      }

      res.send({ result: user, count: 1 })
    }
  )
  // UPDATE partial
  app.patch(
    "/users/:userId",
    validate({
      params: {
        userId: validateId.required(),
      },
      body: {
        email: validateEmail,
        password: validatePassword,
        username: validateUsername,
        displayName: validateDisplayName,
      },
    }),
    async (req, res) => {
      const {
        params: { userId },
        body: { email, username, password, displayName },
      } = req

      const [user] = await db("users").where({ id: userId })

      if (!user) {
        res.status(404).send({ error: ["User not found."] })

        return
      }

      try {
        const [updatedUser] = await db("users")
          .update({
            email,
            username,
            displayName,
            passwordHash: password,
            passwordSalt: password,
            updatedAt: new Date(),
          })
          .where({ id: userId })
          .returning("*")

        res.send(updatedUser)
      } catch (err) {
        if (err.code === "23505") {
          res.status(409).send({
            error: [
              `Duplicated entry for: "${
                err.constraint.split("_").slice(-2, -1)[0]
              }"`,
            ],
          })

          return
        }

        // eslint-disable-next-line no-console
        console.error(err)

        res.status(500).send({ error: ["Something went wrong."] })
      }
    }
  )
}

export default makeUsersRoutes
