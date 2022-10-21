import Race from "../db/models/Race.js"
import validate from "../middlewares/validate.js"
import { validateId, validateLimit, validateOffset, validateDriverName, validateRaceName, validateLocation, validateDate } from "../validators.js"

const makeRacesRoutes = ({ app }) => {
  app.post(
    "/races",
    validate({
      body: {
        name: validateRaceName.required(),
        location: validateLocation.required(),
        raceDate: validateDate.required(),
        seasonId: validateId.required(),
        circuitId: validateId.required()
      },
    }),
    async (req, res) => {
      const { name, location, raceDate, seasonId, circuitId } = req.body

      const race = await Race.query()
        .insert({
          name,
          location,
          raceDate,
          seasonId,
          circuitId
        })
        .returning("*")
      
      res.send({ result: race })
    }
  )

  app.get(
    "/races",
    validate({
      query: {
        limit: validateLimit,
        offset: validateOffset,
      }
    }),
    async(req, res) => {
      const { limit, offset } = req.locals.query
      const races = await Race.query().limit(limit).offset(offset)
      const [{ count }] = await Race.query().count()

      res.send({ result: races , count})
    }
  )

  app.get(
    "/races/:name",
    validate({
      params: {
        name: validateDriverName.required(),
      }
    }),
    async (req, res) => {
      const { name } = req.params
      const race = await Race.query().findOne({ name }).throwIfNotFound()

      res.send({ result: race, count:1 })
    }
  )

  app.get(
    "/races/:seasonId",
    validate({
      params: {
        seasonId: validateId.required(),
      }
    }),
    async (req, res) => {
      const { seasonId } = req.params
      const race = await Race.query().findById(seasonId).throwIfNotFound()

      res.send({ result: race, count:1 })
    }
  )

  app.patch(
    "/races/:raceId",
    validate({
      params: {
        raceId: validateId.required(),
      },
      body: {
        name: validateRaceName.required(),
        location: validateLocation.required(),
        raceDate: validateDate.required(),
        seasonId: validateId.required(),
        circuitId: validateId.required()
      },
    }),
    async (req, res) => {
      const {
        params: { raceId },
        body: { name, location, raceDate, seasonId, circuitId },
      } = req

      const race = await Race.query().findById(raceId).throwIfNotFound()

      const updateRace = await race
        .$query()
        .patch({
          name,
          location,
          raceDate,
          seasonId,
          circuitId,
        })
        .returning("*")
      
      res.send({ result: updateRace, count: 1 })
    }
  )

  app.delete(
    "/races/:raceId",
    validate({
      params: {
        raceId: validateId.required(),
      }
    }),
    async (req, res) => {
      const { raceId } = req.params

      const race = await Race.query().deleteById(raceId).throwIfNotFound()

      res.send({ result: race })
    }
  )
}

export default makeRacesRoutes