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

const makeEventsRoutes = ({ app, db }) => {
  // CREATE
  app.post(
    "/events",
    auth,
    validate({
      body: {
        point: validateUsername.required(),
        pinalty: validateUsername.required(),
        abord: validateNumberOfTurn.required(),
        crash: validateNumberOfTurn.required(),
        puncture: validateNumberOfTurn.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { point, pinalty, abord, crash, puncture },
        session: { user },
      } = req

      try {
        const [event] = await db("events")
          .insert({
            point,
            pinalty,
            abord,
            crash,
            puncture,
            userId: user.id,
          })
          .returning("*")

        const count = await db("events").count()

        res.send({ result: filterDBResult([event]), count })
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
    "/events",
    validate({
      query: {
        limit: validateLimit,
        offset: validateOffset,
        userId: validateId,
      },
    }),
    async (req, res) => {
      const { limit, offset } = req.query

      const events = await db("events").limit(limit).offset(offset)

      if (!events) {
        res.send("not events")
      }

      const count = await db("events").count()
      res.send({ result: events, count })
    }
  )

  // READ single
  app.get(
    "/events/:eventId",
    validate({
      params: {
        eventId: validateId.required(),
      },
    }),
    async (req, res) => {
      const { eventId } = req.params

      const [event] = await db("events").where({ id: eventId })

      if (!event) {
        res.status(404).send({ error: "event not found!" })

        return
      }

      const count = await db("events").count()

      res.send({ result: [event], count })
    }
  )

  // UPDATE partial
  app.patch(
    "/events/:eventId",
    auth,
    validate({
      params: {
        eventId: validateId.required(),
      },
      body: {
        point: validateUsername,
        pinalty: validateUsername,
        abord: validateNumberOfTurn,
        crash: validateNumberOfTurn,
        puncture: validateNumberOfTurn,
      },
    }),
    async (req, res) => {
      const {
        params: { eventId },
        body: { point, pinalty, abord, crash, puncture },
      } = req

      const [event] = await db("events").where({ id: eventId })

      if (!event) {
        res.status(404).send({ error: "event not found." })

        return
      }

      try {
        const [updatedEvent] = await db("events")
          .where({ id: eventId })
          .update({
            point,
            pinalty,
            abord,
            crash,
            puncture,
          })
          .returning("*")

        const count = await db("events").count()

        res.send({ result: [updatedEvent], count })
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
    "/events/:eventId",
    validate({
      params: {
        eventId: validateId.required(),
      },
    }),
    async (req, res) => {
      const {
        params: { eventId },
      } = req
      const [event] = await db("events")
        .where({ id: eventId })
        .del()
        .returning("*")

      const count = await db("events").count()

      res.send({ result: [event], count })
    }
  )
}

export default makeEventsRoutes
