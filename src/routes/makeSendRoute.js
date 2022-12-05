import express from "express"
import mg from "mailgun-js"

console.log(123)
const makeSendRoutes = ({ app, db }) => {
  const mailgun = () =>
    mg({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMIAN,
    })
  // const app = express()
  // app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.post("/api/email", (req, res) => {
    const { email } = req.body
    console.log(email)
    mailgun()
      .messages()
      .send(
        {
          from: "mslimani1983@gmail.com",
          to: `${email}`,
          subject: `test`,
          html: `<div>
            pour rienetialiser le mot de passe clic <a href="http://localhost:3000/users/user-patch"> ICI</a></div>`,
        },
        (error, body) => {
          if (error) {
            console.log(error)
            res.status(500).send({ message: "Error in sending email" })
          } else {
            console.log(body)
            res.send({ message: "Email sent successfully" })
          }
        }
      )
  })

  app.post("/api/message", (req, res) => {
    const { email, message, object } = req.body
    console.log({ email, message, object })
    mailgun()
      .messages()
      .send(
        {
          from: `${email}`,
          to: "mslimani1983@gmail.com",
          subject: `${object}`,
          html: `from ${email} <br/> ${message}`,
        },
        (error, body) => {
          if (error) {
            console.log(error)
            res.status(500).send({ message: "Error in sending email" })
          } else {
            console.log(body)
            res.send({ message: "Email sent successfully" })
          }
        }
      )
  })
}
export default makeSendRoutes
