import News from "../db/models/News.js"
import validate from "../middlewares/validate.js"
import {
  validateContent,
  validateId,
  validateLimit,
  validateOffset,
  validatePostTitle,
} from "../validators.js"

const makeNewsRoutes = ({ app }) => {
  app.post(
    "/news",
    validate({
      body: {
        title: validatePostTitle.required(),
        content: validateContent.required(),
        teamId: validateId.required(),
      },
    }),
    async (req, res) => {
      const { title, content, teamId } = req.body

      const postedNews = await News.query()
        .insert({ title, content, teamId })
        .returning("*")

      res.send({ result: postedNews })
    }
  )
  app.get(
    "/news",
    validate({ query: { limit: validateLimit, offset: validateOffset } }),
    async (req, res) => {
      const { limit, offset } = req.locals.query

      const gottenNews = await News.query()
        .limit(limit)
        .offset(offset)
        .withGraphFetched({ team: true })
        .orderBy("createdAt", "desc")

      res.send({ result: gottenNews })
    }
  )
  app.get(
    "/news/:id",
    validate({ params: { id: validateId.required() } }),
    async (req, res) => {
      const { id } = req.params

      const gottenNews = await News.query()
        .findById(id)
        .throwIfNotFound()
        .withGraphFetched({ team: true })
        .returning("*")

      res.send({ result: gottenNews })
    }
  )
  app.delete(
    "/news/:id",
    validate({ params: { id: validateId.required() } }),
    async (req, res) => {
      const { id } = req.params

      const deletedNews = await News.query()
        .deleteById(id)
        .returning("*")
        .throwIfNotFound()

      res.send({ result: deletedNews })
    }
  )
}

export default makeNewsRoutes
