import hashPassword from "../hashPassword.js"
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
        username: validateUsername.required(),
        displayName: validateDisplayName.required(),
        password: validatePassword.required(),
      },
    }),
    async (req, res) => {
      const { email, username, displayName, password } = req.body
      const [passwordHash, passwordSalt] = hashPassword(password)

      try {
        const [user] = await db("users")
          .insert({
            email,
            username,
            displayName,
            passwordHash,
            passwordSalt,
          })
          .returning("*")

        res.send(user) // filter sensitive data
      } catch (err) {
        if (err.code === "23505") {
          res.status(409).send({
            error: [
              `Duplicated value for "${err.detail.match(/^Key \((\w+)\)/)[1]}"`,
            ],
          })

          return
        }

        // eslint-disable-next-line no-console
        console.error(err)

        res.status(500).send({ error: "Oops. Something went wrong." })
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
      const users = await db("users").limit(limit).offset(offset)

      res.send(users)
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

      res.send(user)
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
        username: validateUsername,
        displayName: validateDisplayName,
        password: validatePassword,
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

      let passwordHash
      let passwordSalt

      if (password) {
        const [hash, salt] = hashPassword(password)

        passwordHash = hash
        passwordSalt = salt
      }

      try {
        const [updatedUser] = await db("users")
          .where({ id: userId })
          .update({
            email,
            username,
            displayName,
            passwordHash,
            passwordSalt,
          })
          .returning("*")

        res.send(updatedUser)
      } catch (err) {
        if (err.code === "23505") {
          res.status(409).send({
            error: [
              `Duplicated value for "${err.detail.match(/^Key \((\w+)\)/)[1]}"`,
            ],
          })

          return
        }

        // eslint-disable-next-line no-console
        console.error(err)

        res.status(500).send({ error: "Oops. Something went wrong." })
      }
    }
  )
  // DELETE
  app.delete(
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

      await db("users").delete().where({ id: userId })

      res.send(user)
    }
  )
}

export default makeUsersRoutes
