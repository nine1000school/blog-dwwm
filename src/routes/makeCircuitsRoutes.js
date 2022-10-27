import filterDBResult from "../filterDBResult.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  validateId,
  validateLimit,
  validateNumberOfTurn,
  validateOffset,
  validateUsername,
} from "../validators.js"

const makeCircuitsRoutes = ({ app, db }) => {
  // CREATE
  app.post(
    "/circuits",
    /*auth,*/
    validate({
      body: {
        name: validateUsername.required(),
        location: validateUsername.required(),
        length: validateNumberOfTurn.required(),
        numberOfTurn: validateNumberOfTurn.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { name, location, length, numberOfTurn },
        // session: { user },
      } = req

      try {
        const [circuit] = await db("circuits")
          .insert({
            name,
            location,
            length,
            numberOfTurn,
            // userId: user.id,
          })
          .returning("*")

        const count = await db("circuits").count()

        res.send({ result: filterDBResult([circuit]), count })
      } catch (err) {
        if (err.code === "23505") {
          res.send({ error: [`${err.detail.match(/^Key \((\w+)\)/)[1]}`] })

          return
        }

        // eslint-disable-next-line no-console
        console.log(err)

        res.send({ error: ["Oops something went wornning"] })
      }
    }
  )

  app.get(
    "/circuits",
    validate({
      query: {
        limit: validateLimit,
        offset: validateOffset,
        userId: validateId,
      },
    }),
    async (req, res) => {
      // const { limit, offset } = req.query

      const circuits = await db("circuits")

      if (!circuits) {
        res.send("not circuits")
      }

      const [{ count }] = await db("circuits").count()
      res.send({ result: circuits, count })
    }
  )

  // READ single
  app.get(
    "/circuits/:circuitId",
    validate({
      params: {
        circuitId: validateId.required(),
      },
    }),
    async (req, res) => {
      const { circuitId } = req.params

      const [circuit] = await db("circuits").where({ id: circuitId })

      if (!circuit) {
        res.status(404).send({ error: "Circuit not found!" })

        return
      }

      const count = await db("circuits").count()

      res.send({ result: [circuit], count })
    }
  )

  // UPDATE partial
  app.patch(
    "/circuits/:circuitId",
    auth,
    validate({
      params: {
        circuitId: validateId.required(),
      },
      body: {
        name: validateUsername,
        location: validateUsername,
        length: validateNumberOfTurn,
        numberOfTurn: validateNumberOfTurn,
      },
    }),
    async (req, res) => {
      const {
        params: { circuitId },
        body: { name, location, length, numberOfTurn },
      } = req

      const [circuit] = await db("circuits").where({ id: circuitId })

      if (!circuit) {
        res.status(404).send({ error: "circuit not found." })

        return
      }

      try {
        const [updatedCircuit] = await db("circuits")
          .where({ id: circuitId })
          .update({
            name,
            location,
            length,
            numberOfTurn,
          })
          .returning("*")

        const count = await db("circuits").count()

        res.send({ result: [updatedCircuit], count })
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
    "/circuits/:circuitId",
    validate({
      params: {
        circuitId: validateId.required(),
      },
    }),
    async (req, res) => {
      const {
        params: { circuitId },
      } = req
      const [circuit] = await db("circuits")
        .where({ id: circuitId })
        .del()
        .returning("*")

      const count = await db("circuits").count()

      res.send({ result: [circuit], count })
    }
  )
  app.delete("/circuits", async (req, res) => {
    const [circuits] = await db("circuits").del().returning("*")
    const count = await db("circuits").count()

    res.send({ result: [circuits], count })
  })
}

export default makeCircuitsRoutes
