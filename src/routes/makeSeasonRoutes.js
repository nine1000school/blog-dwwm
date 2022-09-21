import filterDBResult from "../filterDBResult.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  validateDate,
  validateId,
  validateLimit,
  validateOffset,
  validateUsername,
} from "../validators.js"

const makeSeasonsRoutes = ({ app, db }) => {
  // CREATE
  app.post(
    "/seasons",
    auth,
    validate({
      body: {
        name: validateUsername.required(),
        year: validateDate.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { name, year },
        // session: { user },
      } = req

      try {
        const [season] = await db("seasons")
          .insert({
            name,
            year,
            // userId: user.id,
          })
          .returning("*")
        const count = await db("seasons").count()

        res.send({ result: filterDBResult([season]), count })
      } catch (err) {
        if (err.code === "23505") {
          res.send({
            error: [
              `Duplicated value for "${err.detail.match(/^Key \((\w+)\)/)[1]}"`,
            ],
          })

          return
        }

        // eslint-disable-next-line no-console
        console.error(err)

        res.status(500).send({ error: ["Oops. Something went wrong."] })
      }
    }
  )

  app.get(
    "/seasons",
    validate({
      query: {
        limit: validateLimit,
        offset: validateOffset,
        userId: validateId,
      },
    }),
    async (req, res) => {
      const { limit, offset } = req.query

      const seasons = await db("seasons").limit(limit).offset(offset)

      if (!seasons) {
        res.send("not seasons")
      }

      const count = await db("seasons").count()
      res.send({ result: seasons, count })
    }
  )

  // READ single
  app.get(
    "/seasons/:seasonId",
    validate({
      params: {
        seasonId: validateId.required(),
      },
    }),
    async (req, res) => {
      const { seasonId } = req.params

      const [season] = await db("seasons").where({ id: seasonId })

      if (!season) {
        res.status(404).send({ error: "season not found!" })

        return
      }

      const count = await db("seasons").count()

      res.send({ result: [season], count })
    }
  )

  // UPDATE partial
  app.patch(
    "/seasons/:seasonId",
    auth,
    validate({
      params: {
        seasonId: validateId.required(),
      },
      body: {
        name: validateUsername,
        year: validateDate,
      },
    }),
    async (req, res) => {
      const {
        params: { seasonId },
        body: { name, year },
      } = req

      const [season] = await db("seasons").where({ id: seasonId })

      if (!season) {
        res.status(404).send({ error: "season not found." })

        return
      }

      try {
        const [updatedseason] = await db("seasons")
          .where({ id: seasonId })
          .update({
            name,
            year,
          })
          .returning("*")

        const count = await db("seasons").count()

        res.send({ result: [updatedseason], count })
      } catch (err) {
        if (err.code === "23505") {
          res.send({ error: [`${err.detail.match(/^Key \((\w+)\)/)[1]}`] })

          return
        }

        // eslint-disable-next-line no-console
        console.log(err)

        res.send({ error: ["Ooops. something went worning"] })
      }
    }
  )

  app.delete(
    "/seasons/:seasonId",
    validate({
      params: {
        seasonId: validateId.required(),
      },
    }),
    async (req, res) => {
      const {
        params: { seasonId },
      } = req
      const [season] = await db("seasons")
        .where({ id: seasonId })
        .del()
        .returning("*")

      const count = await db("seasons").count()

      res.send({ result: [season], count })
    }
  )
}

export default makeSeasonsRoutes
