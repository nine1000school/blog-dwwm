import User from "../db/models/User.js"
import filterDBResult from "../filterDBResult.js"
import hashPassword from "../hashPassword.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import hasAccess from "../utils/hasAccess.js"
import {
  validateDisplayName,
  validateEmail,
  validateId,
  validateLimit,
  validateOffset,
  validatePassword,
  validateRole,
  validateUsername,
} from "../validators.js"

const makeUsersRoutes = ({ app }) => {
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

      const user = await User.query()
        .insert({
          email,
          username,
          displayName,
          passwordHash,
          passwordSalt,
        })
        .returning("*")

      res.send({ result: filterDBResult([user]), count: 1 })
    }
  )
  // READ collection
  app.get(
    "/users",
    auth("ADMIN"),
    validate({
      query: {
        limit: validateLimit,
        offset: validateOffset,
      },
    }),
    async (req, res) => {
      const { limit, offset } = req.locals.query
      const users = await User.query().limit(limit).offset(offset)
      const [{ count }] = await User.query().count()

      res.send({ result: filterDBResult(users), count })
    }
  )
  // READ single
  app.get(
    "/users/:username",
    validate({
      params: {
        username: validateUsername.required(),
      },
    }),
    async (req, res) => {
      const { username } = req.params
      const user = await User.query().findOne({ username }).throwIfNotFound()

      res.send({ result: filterDBResult([user]), count: 1 })
    }
  )
  // UPDATE partial
  app.patch(
    "/users/:userId",
    auth(),
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
        session,
      } = req

      if (userId !== session.user.id) {
        hasAccess(req.session, "ADMIN")
      }

      const user = await User.query().findById(userId).throwIfNotFound()

      let passwordHash
      let passwordSalt

      if (password) {
        const [hash, salt] = hashPassword(password)

        passwordHash = hash
        passwordSalt = salt
      }

      const updatedUser = await user
        .$query()
        .patch({
          email,
          username,
          displayName,
          passwordHash,
          passwordSalt,
          updatedAt: new Date(),
        })
        .returning("*")

      res.send({ result: filterDBResult([updatedUser]), count: 1 })
    }
  )
  //PATCH ADMIN
  app.patch(
    "/users/:userId/role",
    auth("ADMIN"),
    validate({
      params: {
        userId: validateId.required()
      },
      body: {
        role: validateRole.required(),
      },
    }),
    async (req, res) => {
      const {
        params: { userId },
        body: { role },
      } = req

      const user = await User.query().findById(userId).throwIfNotFound()

      const updatedRole = await user
        .$query()
        .patch({  
          role,  
          updatedAt: new Date(),
        })
        .returning("*")

      res.send({ result: updatedRole, count: 1 })
    }
  )
  // DELETE
  app.delete(
    "/users/:userId",
    auth("ADMIN"),
    validate({
      params: {
        userId: validateId.required(),
      },
    }),
    async (req, res) => {
      hasAccess("ADMIN")

      const { userId } = req.params

      const user = await User.query().deleteById(userId).throwIfNotFound()

      res.send({ result: filterDBResult([user]), count: 1 })
    }
  )
}

export default makeUsersRoutes