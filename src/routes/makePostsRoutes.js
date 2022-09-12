import filterDBResult from "../filterDBResult.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  validateId,
  validateLimit,
  validateOffset,
  validatePostContent,
  validatePostTitle,
  validatePublishedAt,
  validateSearch,
} from "../validators.js"

const makePostsRoutes = ({ app, db }) => {
  // CREATE
  app.post(
    "/posts",
    auth,
    validate({
      body: {
        title: validatePostTitle.required(),
        content: validatePostContent.required(),
        publishedAt: validatePublishedAt,
      },
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

      res.send({ result: filterDBResult([post]), count: 1 })
    }
  )
  // READ collection
  app.get(
    "/posts",
    validate({
      query: {
        limit: validateLimit,
        offset: validateOffset,
        userId: validateId,
        search: validateSearch,
      },
    }),
    async (req, res) => {
      const { limit, offset, userId, search } = req.query
      const postsQuery = db("posts")
        .select(
          "posts.*",
          "users.id AS users:id",
          "users.displayName AS users:displayName"
        )
        .innerJoin("users", "users.id", "=", "posts.userId")
        .limit(limit)
        .offset(offset)
        .whereNotNull("publishedAt")
        .orderBy("publishedAt", "DESC")
      const countQuery = db("posts").count().whereNotNull("publishedAt")

      if (userId) {
        postsQuery.where({ userId })
        countQuery.where({ userId })
      }

      if (search) {
        const searchPattern = `%${search}%`
        postsQuery.where((query) =>
          query
            .whereILike("title", searchPattern)
            .orWhereILike("content", searchPattern)
        )
        countQuery.where((query) =>
          query
            .whereILike("title", searchPattern)
            .orWhereILike("content", searchPattern)
        )
      }

      const posts = (await postsQuery).map((post) =>
        Object.entries(post).reduce(
          (xs, [key, value]) => {
            if (key.startsWith("users:")) {
              xs.user[key.slice(6)] = value

              return xs
            }

            xs[key] = value

            return xs
          },
          { user: {} }
        )
      )

      const [{ count }] = await countQuery

      res.send({ result: filterDBResult(posts), count })
    }
  )
  // READ single
  app.get(
    "/posts/:postId",
    validate({
      params: {
        postId: validateId.required(),
      },
    }),
    async (req, res) => {
      const { postId } = req.params

      const [post] = await db("posts").where({ id: postId })

      if (!post) {
        res.status(404).send({ error: "Post not found." })

        return
      }

      const formattedPost = Object.entries(post).reduce(
        (xs, [key, value]) => {
          if (key.startsWith("users:")) {
            xs.user[key.slice(6)] = value

            return xs
          }

          xs[key] = value

          return xs
        },
        { user: {} }
      )

      res.send({ result: [formattedPost], count: 1 })
    }
  )
  // UPDATE partial
  app.patch(
    "/posts/:postId",
    // auth,
    validate({
      params: {
        postId: validateId.required(),
      },
      body: {
        title: validatePostTitle,
        content: validatePostContent,
        publishedAt: validatePublishedAt,
      },
    }),
    async (req, res) => {
      const {
        params: { postId },
        body: { title, content, publishedAt },
      } = req

      const [post] = await db("posts").where({ id: postId })

      if (!post) {
        res.status(404).send({ error: "Post not found." })

        return
      }

      const [updatedPost] = await db("posts")
        .where({ id: postId })
        .update({
          title,
          content,
          publishedAt,
          updatedAt: new Date(),
        })
        .returning("*")

      res.send({ result: [updatedPost], count: 1 })
    }
  )
  // DELETE
  app.delete(
    "/posts/:postId",
    validate({ params: { postId: validateId.required() } }),
    async (req, res) => {
      const {
        params: { postId },
      } = req

      const [post] = await db("posts").where({ id: postId })

      if (!post) {
        res.status(404).send({ error: "Post not found." })

        return
      }

      await db("posts").where({ id: postId }).delete()

      res.send({ result: [post], count: 1 })
    }
  )
}

export default makePostsRoutes
