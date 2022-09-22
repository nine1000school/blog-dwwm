import jsonwebtoken from "jsonwebtoken"
import config from "../config.js"
import hashPassword from "../hashPassword.js"
import validate from "../middlewares/validate.js"
import { validateEmailOrUsername, validatePassword } from "../validators.js"

const makeSessionRoutes = ({ app, db }) => {
  app.post(
    "/sign-in",
    validate({
      emailOrUsername: validateEmailOrUsername.required(),
      password: validatePassword.required(),
    }),
    async (req, res) => {
      const { emailOrUsername, password } = req.body

      if (!emailOrUsername) {
        res.status(401).send({ error: ["Invalid credentials."] })

        return
      }

      const [user] = await db("users")
        .where({
          email: emailOrUsername,
        })
        .orWhere({
          username: emailOrUsername,
        })

      if (!user) {
        res.status(401).send({ error: ["Invalid credentials."] })

        return
      }

      const [passwordHash] = hashPassword(password, user.passwordSalt)

      if (passwordHash !== user.passwordHash) {
        res.status(401).send({ error: ["Invalid credentials."] })

        return
      }

      const jwt = jsonwebtoken.sign(
        {
          session: {
            user: {
              id: user.id,
              displayName: user.displayName,
              username: user.username,
              email: user.email,
              role: user.role,
            },
          },
        },
        config.security.jwt.secret,
        { expiresIn: config.security.jwt.expiresIn }
      )

      res.send({ result: [{ jwt }], count: 1 })
    }
  )
}

export default makeSessionRoutes
