import Team from "../db/models/Team.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  validateId,
  validateLimit,
  validateNationnality,
  validateOffset,
  validateTeamName,
} from "../validators.js"

const makeTeamsRoutes = ({ app }) => {
  app.post(
    "/teams",
    // auth("ADMIN"),
    validate({
      body: {
        name: validateTeamName.required(),
        points: validateId.required(),
        requestName: validateTeamName.required(),
      },
    }),
    async (req, res) => {
      const { name, points, requestName } = req.body
      const team = await Team.query()
        .insert({
          name,
          points,
          requestName,
        })
        .returning("*")

      res.send({ result: team })
    }
  )

  app.get(
    "/teams",
    validate({
      query: {
        limit: validateLimit,
        offset: validateOffset,
      },
    }),
    async (req, res) => {
      const { limit, offset } = req.locals.query
      const teams = await Team.query()
        .limit(limit)
        .offset(offset)
        .orderBy("points", "desc")
      const [{ count }] = await Team.query().count()

      res.send({ result: teams, count })
    }
  )

  app.get(
    "/teams/:name",
    validate({
      params: {
        name: validateTeamName.required(),
      },
    }),
    async (req, res) => {
      const { name } = req.params
      const team = await Team.query().findOne({ name }).throwIfNotFound()

      res.send({ result: team })
    }
  )

  app.patch(
    "/teams/:teamId",
    // auth("ADMIN"),
    validate({
      params: {
        teamId: validateId.required(),
      },
      body: {
        name: validateTeamName,
        nationnality: validateNationnality,
        points: validateId,
        requestName: validateTeamName,
      },
    }),
    async (req, res) => {
      const {
        params: { teamId },
        body: { name, points, requestName },
      } = req

      const team = await Team.query().findById(teamId).throwIfNotFound()

      const updatedTeam = await team
        .$query()
        .patch({
          name,
          points,
          requestName,
        })
        .returning("*")

      res.send({ result: updatedTeam })
    }
  )

  app.delete(
    "/teams/:teamId",
    auth("ADMIN"),
    validate({
      params: {
        teamId: validateId.required(),
      },
    }),
    async (req, res) => {
      const { teamId } = req.params

      const team = await Team.query().deleteById(teamId).throwIfNotFound()

      res.send({ result: team })
    }
  )
}

export default makeTeamsRoutes
