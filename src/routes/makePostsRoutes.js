import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  validatePostContent,
  validatePostTitle,
  validatePublishedAt,
} from "../validators.js"

const makePostsRoutes = ({ app, db }) => {
  app.post(
    "/posts",
    auth,
    validate({
      title: validatePostTitle.required(),
      content: validatePostContent.required(),
      publishedAt: validatePublishedAt,
    }),
    async (req, res) => {
      const {
        body: { title, content, publishedAt },
        session: { user },
      } = req

      const [post] = await db("posts")
        .insert({
          title,
          content,
          publishedAt,
          userId: user.id,
        })
        .returning("*")

      res.send({ result: [post], count: 1 })
    }
  )
}

export default makePostsRoutes
