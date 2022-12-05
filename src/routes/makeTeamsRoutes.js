import validate from "../middlewares/validate.js"
import auth from "../middlewares/auth.js"
import { validateId, validateUsername } from "../validators.js"

const makeTeamsRoutes = ({ app, db }) => {
  //CREATE
  app.post(
    "/teams",
    // auth,
    validate({
      body: {
        name: validateUsername.required(),
        nationnality: validateUsername.required(),
      },
    }),
    async (req, res) => {
      const { name, nationnality } = req.body

      try {
        const teams = await db("teams")
          .insert({ name, nationnality })
          .returning("*")
        const count = await db("teams").count()

        res.send({ result: teams, count })
      } catch (err) {
        if (err.code === "23505") {
          res.send({
            error: [
              `Duplicated value for "${err.detail.match(/^Key \((\w+)\)/)[1]}"`,
            ],
          })

          return
        }

        // eslint-disable-next-line no-console
        console.log(err)
        res.send("Oops something went wrong")
      }
    }
  )

  //READ collection
  app.get("/teams", async (req, res) => {
    const teams = await db("teams")

    if (!teams) {
      res.send("Teams not found")

      return
    }

    const count = await db("teams").count()

    res.send({ result: teams, count })
  })

  //READ single
  app.get(
    "/teams/:teamId",
    validate({
      params: { teamId: validateId },
    }),
    async (req, res) => {
      const teamId = req.params
      const [team] = await db("teams").where({
        id: teamId,
      })

      if (!team) {
        res.send("Error: team doesn't exist")

        return
      }

      const count = await db("teams").count()

      res.send({ result: team, count })
    }
  )

  //UPDATE

  app.patch(
    "/teams/:teamId",
    auth,
    validate({
      params: {
        teamId: validateId,
      },
      body: {
        name: validateUsername,
        nationnality: validateUsername,
      },
    }),
    async (req, res) => {
      const teamId = req.params
      const { name, nationnality } = req.body
      const team = await db("teams").where({ id: teamId })

      if (!team) {
        res.send("error: Team not found")

        return
      }

      try {
        const teams = await db("teams")
          .where({ id: teamId })
          .update({ name, nationnality })
          .returning("*")

        const count = await db("teams").count()

        res.send({ result: teams, count })
      } catch (err) {
        if (err.code === "23505") {
          res.send({
            error: [
              `Duplicated value for "${err.detail.match(/^Key \((\w+)\)/)[1]}"`,
            ],
          })

          return
        }

        // eslint-disable-next-line no-console
        console.log(err)
        res.send("Oops something went wrong")
      }
    }
  )

  //DELETE
  app.delete(
    "/teams/:teamId",
    validate({
      params: { teamId: validateId },
    }),
    async (req, res) => {
      const teamId = req.params
      const team = await db("teams").where({ id: teamId }).del()

      if (!team) {
        res.send("Error: team doesn't exist")

        return
      }

      const count = await db("teams").count()

      res.send({ result: team, count })
    }
  )
}

export default makeTeamsRoutes
