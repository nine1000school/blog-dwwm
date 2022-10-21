import Season from "../db/models/Season.js"
import validate from "../middlewares/validate.js"
import { validateDate, validateId, validateLimit, validateOffset, validateSeasonName } from "../validators.js"

const makeSeasonRoutes = ({ app }) => {
  app.post(
    "/seasons",
    validate({
      body: {
        name: validateSeasonName.required(),
        year: validateDate.required(),
      }
    }),
    async (req, res) => {
      const { name, year } = req.body

      const season = await Season.query()
        .insert({
          name,
          year,
        })
        .returning("*")
      
      res.send({ result: season })
    }
  )

  app.get(
    "/seasons",
    validate({
      query: {
        limit: validateLimit,
        offset: validateOffset,
      }
    }),
    async(req, res) => {
      const { limit, offset } = req.locals.query
      const seasons = await Season.query().limit(limit).offset(offset)
      const [{ count }] = await Season.query().count()

      res.send({ result: seasons , count})
    }
  )

  app.get(
    "/seasons/:year",
    validate({
      params: {
        date: validateDate.required(),
      }
    }),
    async (req, res) => {
      const { date } = req.params
      const season = await Season.query().findOne({ date }).throwIfNotFound()

      res.send({ result: season, count:1 })
    }
  )

  app.patch(
    "/seasons/:seasonId",
    validate({
      params: {
        seasonId: validateId.required()
      },
      body: {
        name: validateSeasonName,
        year: validateDate,
      }
    }),
    async (req, res) => {
      const {
        params: { seasonId },
        body: { name, year },
      } = req

      const season = await Season.query().findById(seasonId).throwIfNotFound()

      const updatedSeason = await season
        .$query()
        .patch({
          name,
          year,
        })
        .returning("*")
      
      res.send({ result: updatedSeason, count: 1 })
    }
  )

  app.delete(
    "/seasons/:seasonId",
    validate({
      params: {
        seasonId: validateId.required(),
      }
    }),
    async (req, res) => {
      const { seasonId } = req.params

      const season = await Season.query().deleteById(seasonId).throwIfNotFound()

      res.send({ result: season })
    }
  )
}

export default makeSeasonRoutes