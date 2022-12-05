import Race from "../db/models/Race.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import { validateId, validateLimit, validateOffset, validateDriverName, validateRaceName, validateLocation, validateDate } from "../validators.js"

const makeRacesRoutes = ({ app }) => {
  app.post(
    "/races",
    auth("ADMIN"),
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
    auth("ADMIN"),
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
    auth("ADMIN"),
    validate({
      params: {
        name: validateDriverName.required(),
      }
    }),
    async (req, res) => {
      const { name } = req.params
      const race = await Race.query().findOne({ name }).throwIfNotFound()

      res.send({ result: race})
    }
  )

  app.get(
    "/races/season/:seasonId",
    auth("ADMIN"),
    validate({
      params: {
        seasonId: validateId.required(),
      }
    }),
    async (req, res) => {
      const { seasonId } = req.params
      const race = await Race.query()
        .where('seasonId', seasonId)
        .throwIfNotFound()

      res.send({ result: race})
    }
  )

  app.get(
    "/races/circuit/:circuitId",
    auth("ADMIN"),
    validate({
      params: {
        circuitId: validateId.required(),
      }
    }),
    async (req, res) => {
      const { circuitId } = req.params
      const race = await Race.query()
        .where('circuitId', circuitId)
        .throwIfNotFound()

      res.send({ result: race })
    }
  )

  app.patch(
    "/races/:raceId",
    auth("ADMIN"),
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
      
      res.send({ result: updateRace })
    }
  )

  app.delete(
    "/races/:raceId",
    auth("ADMIN"),
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