import Circuit from "../db/models/Circuit.js"
import validate from "../middlewares/validate.js"
import { validateCircuitName, validateId, validateLength, validateLimit, validateLocation, validateOffset, validateTurnNumbers } from "../validators.js"

const makeCircuitsRoutes = ({ app }) => {
  app.post(
    "/circuits",
    validate({
      body: {
        name: validateCircuitName.required(),
        location: validateLocation.required(),
        length: validateLength.required(),
        numberOfTurn: validateTurnNumbers.required(),
      }
    }),
    async (req, res) => {
      const { name, location, length, numberOfTurn } = req.body

      const circuit = await Circuit.query()
        .insert({
          name,
          location,
          length,
          numberOfTurn
        })
        .returning("*")
      
      res.send({ result: circuit })
    }
  )

  app.get(
    "/circuits",
    validate({
      query: {
        limit: validateLimit,
        offset: validateOffset,
      }
    }),
    async(req, res) => {
      const { limit, offset } = req.locals.query
      const circuits = await Circuit.query().limit(limit).offset(offset)
      const [{ count }] = await Circuit.query().count()

      res.send({ result: circuits , count})
    }
  )

  app.get(
    "/circuits/:name",
    validate({
      params: {
        name: validateCircuitName.required(),
      }
    }),
    async (req, res) => {
      const { name } = req.params
      const circuit = await Circuit.query().findOne({ name }).throwIfNotFound()

      res.send({ result: circuit })
    }
  )

  app.patch(
    "/circuits/:circuitId",
    validate({
      params: {
        circuitId: validateId.required()
      },
      body: {
        name: validateCircuitName,
        location: validateLocation,
        length: validateLength,
        numberOfTurn: validateTurnNumbers,
      }
    }),
    async (req, res) => {
      const {
        params: { circuitId },
        body: { name, location, length, numberOfTurn }
      } = req

      const circuit = await Circuit.query().findById(circuitId).throwIfNotFound()

      const updatedCircuit = await circuit
        .$query()
        .patch({
          name,
          location,
          length,
          numberOfTurn
        })
        .returning("*")
      
      res.send({ result: updatedCircuit })
    }
  )

  app.delete(
    "/circuits/:circuitId",
    validate({
      params: {
        circuitId: validateId.required(),
      }
    }),
    async (req, res) => {
      const { circuitId } = req.params

      const circuit = await Circuit.query().deleteById(circuitId).throwIfNotFound()

      res.send({ result: circuit })
    }
  )
}

export default makeCircuitsRoutes