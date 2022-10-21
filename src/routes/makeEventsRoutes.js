import RaceEvent from "../db/models/RaceEvent.js"
import validate from "../middlewares/validate.js"
import { validateEventAbord, validateEventCrash, validateEventPenalty, validateEventPoint, validateEventPuncture, validateId, validateLimit, validateOffset } from "../validators.js"

const makeEventsRoutes = ({ app }) => {
  app.post(
    "/events",
    validate({
      body: {
        point: validateEventPoint.required(),
        penalty: validateEventPenalty,
        abord: validateEventAbord,
        crash: validateEventCrash,
        puncture: validateEventPuncture,
        raceId: validateId.required(),
      }
    }),
    async (req, res) => {
      const { point, penalty, abord, crash, puncture, raceId } = req.body

      const event = await RaceEvent.query()
        .insert({
          point,
          penalty,
          abord,
          crash,
          puncture,
          raceId,
        })
        .returning("*")
      
      res.send({ result: event })
    }
  )

  app.get(
    "/events",
    validate({
      query: {
        limit: validateLimit,
        offset: validateOffset,
      }
    }),
    async(req, res) => {
      const { limit, offset } = req.locals.query
      const events = await RaceEvent.query().limit(limit).offset(offset)
      const [{ count }] = await RaceEvent.query().count()

      res.send({ result: events , count})
    }
  )

  app.get(
    "/events/:eventId",
    validate({
      params: {
        eventId: validateId.required(),
      }
    }),
    async (req, res) => {
      const { eventId } = req.params
      const event = await RaceEvent.query().findOne({ eventId }).throwIfNotFound()

      res.send({ result: event, count:1 })
    }
  )

  app.patch(
    "/events/:eventId",
    validate({
      params: {
        eventId: validateId.required()
      },
      body: {
        point: validateEventPoint,
        penalty: validateEventPenalty,
        abord: validateEventAbord,
        crash: validateEventCrash,
        puncture: validateEventPuncture,
        raceId: validateId,
      }
    }),
    async (req, res) => {
      const {
        params: { eventId },
        body: { point, penalty, abord, crash, puncture, raceId }
      } = req

      const event = await RaceEvent.query().findById(eventId).throwIfNotFound()

      const updatedEvent = await event
        .$query()
        .patch({
          point,
          penalty,
          abord,
          crash,
          puncture,
          raceId,
        })
        .returning("*")
      
      res.send({ result: updatedEvent, count: 1 })
    }
  )

  app.delete(
    "/events/:eventId",
    validate({
      params: {
        eventId: validateId.required(),
      }
    }),
    async (req, res) => {
      const { eventId } = req.params

      const event = await RaceEvent.query().deleteById(eventId).throwIfNotFound()

      res.send({ result: event })
    }
  )
}

export default makeEventsRoutes