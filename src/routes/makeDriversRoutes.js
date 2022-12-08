import Driver from "../db/models/Driver.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  validateId,
  validateLimit,
  validateNationnality,
  validateOffset,
  validateDriverName,
} from "../validators.js"

const makeDriversRoutes = ({ app }) => {
  app.post(
    "/drivers",
    auth("ADMIN"),
    validate({
      body: {
        name: validateDriverName.required(),
        nationnality: validateNationnality.required(),
        teamId: validateId.required(),
      },
    }),
    async (req, res) => {
      const { name, nationnality, teamId } = req.body

      const driver = await Driver.query()
        .insert({
          name,
          nationnality,
          teamId,
        })
        .returning("*")

      res.send({ result: driver })
    }
  )

  app.get(
    "/drivers",
    validate({
      query: {
        limit: validateLimit,
        offset: validateOffset,
      },
    }),
    async (req, res) => {
      const { limit, offset } = req.locals.query
      const drivers = await Driver.query().limit(limit).offset(offset)
      const [{ count }] = await Driver.query().count()

      res.send({ result: drivers, count })
    }
  )

  app.get(
    "/drivers/:name",
    validate({
      params: {
        name: validateDriverName.required(),
      },
    }),
    async (req, res) => {
      const { name } = req.params
      const driver = await Driver.query().findOne({ name }).throwIfNotFound()

      res.send({ result: driver })
    }
  )

  app.patch(
    "/drivers/:driverId",
    auth("ADMIN"),
    validate({
      params: {
        driverId: validateId.required(),
      },
      body: {
        name: validateDriverName,
        nationnality: validateNationnality,
        teamId: validateId,
      },
    }),
    async (req, res) => {
      const {
        params: { driverId },
        body: { name, nationnality, teamId },
      } = req

      const driver = await Driver.query().findById(driverId).throwIfNotFound()

      const updatedDriver = await driver
        .$query()
        .patch({
          name,
          nationnality,
          teamId,
        })
        .returning("*")

      res.send({ result: updatedDriver })
    }
  )

  app.delete(
    "/drivers/:driverId",
    auth("ADMIN"),
    validate({
      params: {
        driverId: validateId.required(),
      },
    }),
    async (req, res) => {
      const { driverId } = req.params

      const driver = await Driver.query().deleteById(driverId).throwIfNotFound()

      res.send({ result: driver })
    }
  )
}

export default makeDriversRoutes
