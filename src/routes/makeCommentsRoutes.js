import Comment from "../db/models/Comment.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import hasAccess from "../utils/hasAccess.js"
import { validateContent, validateDate, validateId, validateLimit, validateOffset, validateSeasonName } from "../validators.js"

const makeCommentsRoutes = ({ app }) => {
  app.post(
    "/comments",
    auth(),
    validate({
      body: {
        content: validateContent.required(),
        userId: validateId.required(),
        raceId: validateId.required(),
      }
    }),
    async (req, res) => {
      const { content, userId, raceId } = req.body

      const comment = await Comment.query()
        .insert({
          content,
          userId,
          raceId,
        })
        .returning("*")
      
      res.send({ result: comment })
    }
  )

  app.get(
    "/comments",
    auth("ADMIN"),
    validate({
      query: {
        limit: validateLimit,
        offset: validateOffset,
      }
    }),
    async(req, res) => {
      const { limit, offset } = req.locals.query
      const comments = await Comment.query().limit(limit).offset(offset)
      const [{ count }] = await Comment.query().count()

      res.send({ result: comments , count})
    }
  )

  app.get(
    "/comments/:commentId",
    auth(),
    validate({
      params: {
        commentId: validateId.required(),
      }
    }),
    async (req, res) => {
      const { commentId } = req


      const comment = await Comment.query().findById(commentId).throwIfNotFound()

      res.send({ result: comment })
    }
  )
  
  app.patch(
    "/comments/:commentId",
    auth(),
    validate({
      params: {
        commentId: validateId.required()
      },
      body: {
        content: validateSeasonName,
        userId: validateDate,
        raceId: validateId,
      }
    }),
    async (req, res) => {
      const {
        params: { commentId },
        body: { content, userId, raceId },
        session
      } = req

      if (userId !== session.user.id) {
        hasAccess(req.session, "ADMIN")
      }

      const comment = await Comment.query().findById(commentId).throwIfNotFound()

      const updatedSeason = await comment
        .$query()
        .patch({
          content,
          userId,
          raceId,
          updateAt: new Date()
        })
        .returning("*")
      
      res.send({ result: updatedSeason })
    }
  )

  app.delete(
    "/comments/:commentId",
    auth(),
    validate({
      params: {
        commentId: validateId.required(),
      }
    }),
    async (req, res) => {
      const { commentId } = req.params


      const comment = await Comment.query().deleteById(commentId).throwIfNotFound()

      res.send({ result: comment })
    }
  )
}

export default makeCommentsRoutes