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
          <img
            className="w-64 h-32"
            src="https://www.pngmart.com/files/10/Formula-1-Logo-PNG-File.png"
            alt="logo f1"
          />
          
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
}
export default makeSendRoutes
