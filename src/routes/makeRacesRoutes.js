import filterDBResult from "../filterDBResult.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  validateDate,
  validateId,
  validateLimit,
  validateLocation,
  validateOffset,
  validateRaceName,
  validateSearch,
} from "../validators.js"

const makeRacesRoutes = ({ app, db }) => {
  // CREATE
  app.post(
    "/races",
    auth,
    validate({
      body: {
        raceId: validateId.required(),
        name: validateRaceName.required(),
        location: validateLocation.required(),
        date: validateDate.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { name, raceId, location, date},
        session: { user },
      } = req

      const [race] = await db("races")
        .insert({
          name,
          raceId,
          location,
          date,
          seasonId: season.id,
          circuitId: circuit.id,
        })
        .returning("*")

      res.send({ result: filterDBResult([race]), count: 1 })
    }
  )
  // READ collection
  app.get(
    "/races",
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
      const racesQuery = db("races").limit(limit).offset(offset)
      const countQuery = db("races").count()

      if (raceId) {
        racesQuery.where({ raceId })
        countQuery.where({ raceId })
      }

      if (userId) {
        racesQuery.where({ userId })
        countQuery.where({ userId })
      }

      if (search) {
        const searchPattern = `%${search}%`
        racesQuery.where((query) =>
          query.whereILike("content", searchPattern)
        )
        countQuery.where((query) => query.whereILike("content", searchPattern))
      }

      const races = await racesQuery
      const [{ count }] = await countQuery

      res.send({ result: filterDBResult(races), count })
    }
  )
  // READ single
  app.get(
    "/races/:raceId",
    validate({
      params: {
        raceId: validateId.required(),
      },
    }),
    async (req, res) => {
      const { raceId } = req.params

      const [race] = await db("races").where({ id: raceId })

      if (!race) {
        res.status(404).send({ error: "Comment not found." })

        return
      }

      res.send({ result: [race], count: 1 })
    }
  )
  // UPDATE partial
  app.patch(
    "/races/:raceId",
      validate({
        params: {
          raceId: validateId.required(),
        },
        body: {
          name: validateRaceName.required(),
          location: validateLocation.required(),
          date: validateDate.required(),
        },
      }),
     async (req, res) => {
      const {
        params: { raceId },
        body: { name, location, date },
      } = req

      const [race] = await db("races").where({ id: raceId })

      if (!race) {
        res.status(404).send({ error: "Race not found." })

        return
      }

      const [updateRace] = await db("races")
        .where({ id: raceId })
        .update({
          name,
          location,
          date,
          updatedAt: new Date(),
        })

      res.send({ result: [updateRace], count: 1 })
    }
  )
  // DELETE
  app.delete(
    "/races/:raceId",
    validate({ params: { raceId: validateId.required() } }),
    async (req, res) => {
      const {
        params: { raceId },
      } = req

      const [race] = await db("races").where({ id: raceId })

      if (!race) {
        res.status(404).send({ error: "Race not found." })

        return
      }

      await db("races").where({ id: raceId }).delete()

      res.send({ result: [race], count: 1 })
    }
  )
}

export default makeRacesRoutes
