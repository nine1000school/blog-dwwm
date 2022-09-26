import filterDBResult from "../filterDBResult.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  validateCommentContent,
  validateId,
  validateLimit,
  validateOffset,
  validateSearch,
} from "../validators.js"

const makeCommentsRoutes = ({ app, db }) => {
  // CREATE
  app.post(
    "/comments",
    auth,
    // validate({
    //   body: {
    //     raceId: validateId.required(),
    //     content: validateCommentContent.required(),
    //   },
    // }),
    async (req, res) => {
      const {
        body: { content, raceId },
        session: { user },
      } = req

      const [comment] = await db("comments")
        .insert({
          content,
          raceId,
          userId: user.id,
        })
        .returning("*")

      res.send({ result: filterDBResult([comment]), count: 1 })
    }
  )
  // READ collection
  app.get(
    "/comments",
    validate({
      query: {
        limit: validateLimit,
        offset: validateOffset,
        userId: validateId,
        raceId: validateId,
        search: validateSearch,
      },
    }),
    async (req, res) => {
      const { limit, offset, userId, raceId, search } = req.query
      const commentsQuery = db("comments").limit(limit).offset(offset)
      const countQuery = db("comments").count()

      if (raceId) {
        commentsQuery.where({ raceId })
        countQuery.where({ raceId })
      }

      if (userId) {
        commentsQuery.where({ userId })
        countQuery.where({ userId })
      }

      if (search) {
        const searchPattern = `%${search}%`
        commentsQuery.where((query) =>
          query.whereILike("content", searchPattern)
        )
        countQuery.where((query) => query.whereILike("content", searchPattern))
      }

      const comments = await commentsQuery
      const [{ count }] = await countQuery

      res.send({ result: filterDBResult(comments), count })
    }
  )
  // READ single
  app.get(
    "/comments/:commentId",
    validate({
      params: {
        commentId: validateId.required(),
      },
    }),
    async (req, res) => {
      const { commentId } = req.params

      const [comment] = await db("comments").where({ id: commentId })

      if (!comment) {
        res.status(404).send({ error: "Comment not found." })

        return
      }

      res.send({ result: [comment], count: 1 })
    }
  )
  // UPDATE partial
  app.patch(
    "/comments/:commentId",
    validate({
      params: {
        commentId: validateId.required(),
      },
      body: {
        content: validateCommentContent.required(),
      },
    }),
    async (req, res) => {
      const {
        params: { commentId },
        body: { content },
      } = req

      const [comment] = await db("comments").where({ id: commentId })

      if (!comment) {
        res.status(404).send({ error: "Comment not found." })

        return
      }

      const [updatedComment] = await db("comments")
        .where({ id: commentId })
        .update({
          content,
          updatedAt: new Date(),
        })
        .returning("*")

      res.send({ result: [updatedComment], count: 1 })
    }
  )
  // DELETE
  app.delete(
    "/comments/:commentId",
    validate({ params: { commentId: validateId.required() } }),
    async (req, res) => {
      const {
        params: { commentId },
      } = req

      const [comment] = await db("comments").where({ id: commentId })

      if (!comment) {
        res.status(404).send({ error: "Comment not found." })

        return
      }

      await db("comments").where({ id: commentId }).delete()

      res.send({ result: [comment], count: 1 })
    }
  )
}

export default makeCommentsRoutes
