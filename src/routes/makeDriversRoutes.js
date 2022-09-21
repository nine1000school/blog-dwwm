import validate from "../middlewares/validate"
import auth from "../middlewares/auth"
import {
  validateId,
  validateNationnality,
  validateUsername,
} from "../validators"

const makeDriversRoutes = ({ app, db }) => {
  //CREATE
  app.post(
    "/drivers",
    auth,
    validate({
      body: {
        name: validateUsername.required(),
        nationnality: validateNationnality.required(),
        teamId: validateId.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { name, nationnality },
        session: { team },
      } = req

      try {
        const drivers = await db("drivers")
          .insert({ name, nationnality, teamId: team.id })
          .returning("*")
        const count = await db("drivers").count()

        res.send({ result: drivers, count })
      } catch (err) {
        if (err.code === "23505") {
          res.send({
            error: [
              `Duplicated value for "${err.detail.match(/^Key \((\w+)\)/)[1]}"`,
            ],
          })

          return
        }

        console.log(err)
        res.send("Oops something went wrong")
      }
    }
  )

  //READ collection
  app.get("/drivers", async (req, res) => {
    const drivers = await db("drivers")

    if (!drivers) {
      res.send("Drivers not found")

      return
    }

    const count = await db("drivers").count()

    res.send({ result: drivers, count })
  })

  //READ single
  app.get(
    "/drivers/:driverId",
    validate({
      params: { driverId: validateId },
    }),
    async (req, res) => {
      const driverId = req.params
      const [driver] = await db("drivers").where({
        id: driverId,
      })

      if (!driver) {
        res.send("Error: driver doesn't exist")

        return
      }

      const count = await db("drivers").count()

      res.send({ result: driver, count })
    }
  )

  //UPDATE

  app.patch(
    "/drivers/:driverId",
    auth,
    validate({
      params: {
        teamId: validateId,
      },
      body: {
        name: validateUsername,
        nationnality: validateNationnality,
      },
    }),
    async (req, res) => {
      const driverId = req.params
      const { name, nationnality } = req.body
      const driver = await db("drivers").where({ id: driverId })

      if (!driver) {
        res.send("error: Driver not found")

        return
      }

      try {
        const drivers = await db("drivers")
          .where({ id: driverId })
          .update({ name, nationnality })
          .returning("*")

        const count = await db("drivers").count()

        res.send({ result: drivers, count })
      } catch (err) {
        if (err.code === "23505") {
          res.send({
            error: [
              `Duplicated value for "${err.detail.match(/^Key \((\w+)\)/)[1]}"`,
            ],
          })

          return
        }

        console.log(err)
        res.send("Oops something went wrong")
      }
    }
  )
  //DELETE
  app.delete(
    "/drivers/:driverId",
    validate({
      params: { driverId: validateId },
    }),
    async (req, res) => {
      const driverId = req.params
      const driver = await db("drivers").where({ id: driverId }).del()

      if (!driver) {
        res.send("Error: team doesn't exist")

        return
      }

      const count = await db("drivers").count()

      res.send({ result: driver, count })
    }
  )
}

export default makeDriversRoutes
