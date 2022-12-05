
import Team from "../db/models/Team.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import { validateId, validateLimit, validateNationnality, validateOffset, validateTeamName } from "../validators.js"

const makeTeamsRoutes = ({ app }) => {
  app.post(
    "/teams",
    auth("ADMIN"),
    validate({
      body: {
        name: validateTeamName.required(),
        nationnality: validateNationnality.required(),
      }
    }),
    async (req, res) => {
      const { name, nationnality } = req.body
      const team = await Team.query()
        .insert({
          name,
          nationnality,
        })
        .returning("*")
      
      res.send({ result: team })
    }
  )

  app.get(
    "/teams",
    auth("ADMIN"),
    validate({
      query: {
        limit: validateLimit,
        offset: validateOffset,
      }
    }),
    async(req, res) => {
      const { limit, offset } = req.locals.query
      const teams = await Team.query().limit(limit).offset(offset)
      const [{ count }] = await Team.query().count()

      res.send({ result: teams , count})
    }
  )

  app.get(
    "/teams/:name",
    auth("ADMIN"),
    validate({
      params: {
        name: validateTeamName.required(),
      }
    }),
    async (req, res) => {
      const { name } = req.params
      const team = await Team.query().findOne({ name }).throwIfNotFound()

      res.send({ result: team })
    }
  )

  app.patch(
    "/teams/:teamId",
    auth("ADMIN"),
    validate({
      params: {
        teamId: validateId.required()
      },
      body: {
        name: validateTeamName,
        nationnality: validateNationnality,
      }
    }),
    async (req, res) => {
      const {
        params: { teamId },
        body: { name, nationnality },
      } = req

      const team = await Team.query().findById(teamId).throwIfNotFound()

      const updatedTeam = await team
        .$query()
        .patch({
          name,
          nationnality,
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
      }
    }),
    async (req, res) => {
      const { teamId } = req.params

      const team = await Team.query().deleteById(teamId).throwIfNotFound()

      res.send({ result: team })
    }
  )
}

export default makeTeamsRoutes