import User from "../db/model/User.js"
import filterDBResult from "../filterDBResult.js"
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
        const user = await User.query()
          .insert({
            email,
            username,
            displayName,
            passwordHash,
            passwordSalt,
          })
          .returning("*")
        const [{ count }] = await User.query().count()

        res.send({ result: filterDBResult([user]), count }) // filter sensitive data
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

        res.status(500).send({ error: ["Oops. Something went wrong."] })
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
      const users = await User.query().limit(limit).offset(offset)
      const [{ count }] = await User.query().count()

      res.send({ result: filterDBResult(users), count })
    }
  )
  // READ single
  app.get(
    "/users/:userId",
    // validate({
    //   params: {
    //     userId: validateId.required(),
    //   },
    // }),
    async (req, res) => {
      const { userId } = req.params

      if (typeof userId == "number") {
        const user = await User.query().findById(userId)
        const [{ count }] = await User.query().count()

        if (!user) {
          res.status(404).send({ error: ["User not found."] })

          return
        }

        res.send({ result: filterDBResult([user]), count })

        return
      }

      // get par email

      const [user] = await db("users")
        .where({ email: userId })
        .select("id", "email", "username", "displayName")

      if (!user) {
        res.status(200).send("Ok")

        return
      }

      console.log(user)

      res.send({ result: user })
    }
  )

  // UPDATE partial
  app.patch(
    "/users/:userId",
    // validate({
    //   params: {
    //     userId: validateId.required(),
    //   },
    // ,
    // body: {
    //   email: validateEmail,
    //   username: validateUsername,
    //   displayName: validateDisplayName,
    //   password: validatePassword,
    // },
    // }),
    async (req, res) => {
      const {
        params: { userId },
        body: { password },
      } = req

      const [user] = await db("users").where({ email: userId })
      // User.query().findById(userId)

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
        const [updatedUser] = await await db("users")
          .where({ email: userId })
          // User.query().findById(userId)
          .update({
            passwordHash,
            passwordSalt,
            updatedAt: new Date(),
          })
          .returning("*")

        res.send({ result: [updatedUser] })
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

      res.send({ result: filterDBResult([user]), count: 1 })
    }
  )
}

export default makeUsersRoutes
