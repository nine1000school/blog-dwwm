import cors from "cors"
import express from "express"
import knex from "knex"
import { Model } from "objection"
import config from "./config.js"
import handleErrrors from "./middlewares/handleErrors.js"
import makeCircuitsRoutes from "./routes/makeCircuitsRoutes.js"
import makeCommentsRoutes from "./routes/makeCommentsRoutes.js"
import makeDriversRoutes from "./routes/makeDriversRoutes.js"
import makeEventsRoutes from "./routes/makeEventsRoutes.js"
import makeNewsRoutes from "./routes/makeNewsRoutes.js"
import makeRacesRoutes from "./routes/makeRacesRoutes.js"
import makeSeasonRoutes from "./routes/makeSeasonsRoutes.js"
import makeSessionRoutes from "./routes/makeSessionRoutes.js"
import makeTeamsRoutes from "./routes/makeTeamsRoutes.js"
import makeUsersRoutes from "./routes/makeUsersRoutes.js"

const app = express()
const db = knex(config.db)

Model.knex(db)

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  req.locals = {
    params: req.params,
    query: req.query,
    body: req.body,
  }

  next()
})

// app.get("/users/:username", (req, res)=> res.send(` #${req.params.username})`))

makeUsersRoutes({ app, db })
makeSessionRoutes({ app, db })
makeRacesRoutes({ app, db })
makeCommentsRoutes({ app, db })
makeTeamsRoutes({ app, db })
makeSeasonRoutes({ app, db })
makeDriversRoutes({ app, db })
makeCircuitsRoutes({ app, db })
makeEventsRoutes({ app, db })
makeNewsRoutes({ app })

app.use(handleErrrors)

app.listen(config.server.port, () =>
  // eslint-disable-next-line no-console
  console.log(`Listening on :${config.server.port}`)
)
