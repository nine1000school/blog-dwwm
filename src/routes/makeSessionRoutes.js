import jsonwebtoken from "jsonwebtoken"
import config from "../config.js"
import User from "../db/models/User.js"
import validate from "../middlewares/validate.js"
import { send401 } from "../utils/http.js"
import { validateEmail, validateEmailOrUsername, validatePassword } from "../validators.js"

const makeSessionRoutes = ({ app }) => {
  app.post(
    "/sign-in",
    validate({
      emailOrUsername: validateEmailOrUsername.required(),
      password: validatePassword.required(),
    }),
    async (req, res) => {
      const { emailOrUsername, password } = req.body

      if (!emailOrUsername) {
        res.status(401).send({ error: ["Enter your Email or Username"] })

        return
      }
      
      if (!password) {
        res.status(401).send({ error: ["Enter your password"] })

        return
      }

      const user = await User.query()
        .findOne({
          email: emailOrUsername,
        })
        .orWhere({
          username: emailOrUsername,
        })

      if (!user) {
        send401(res)

        return
      }

      if (!user.checkPassword(password)) {
        send401(res)

        return
      }

      const jwt = jsonwebtoken.sign(
        {
          session: {
            user: {
              id: user.id,
              displayName: user.displayName,
              username: user.username,
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
  
  app.patch(
    "/reset-password",
    validate({
      body: {
        password: validatePassword.required(),
      }
    }),
    async (req, res) => {
      const { password } = req.body
      const resetPassword = await User
        .$query()
        .patch({ password })
        .returning("*")
      
      res.send({ result: resetPassword })
    }
  )

  app.get(
    "/forgot-password",
    validate({
      body: {
        email: validateEmail.required(),
      }
    }),
    async (req, res) => {
      const { email } = req.body

      if (!email) {
        res.status(401).send({ error: ["Enter your Email"] })

        return
      }

      const user = await User.query()
        .findOne({
          email: email,
        })

      if (!user) {
        send401(res)

        return
      }

      res.send({user})
    }
  )
}

export default makeSessionRoutes