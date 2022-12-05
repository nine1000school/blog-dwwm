import cors from "cors"
import express from "express"
import knex from "knex"
import { Model } from "objection"
import config from "./config.js"
import makeCircuitsRoutes from "./routes/makeCircuitsRoutes.js"
import makeCommentsRoutes from "./routes/makeCommentsRoutes.js"
import makeDriversRoutes from "./routes/makeDriversRoutes.js"
import makeRacesRoutes from "./routes/makeRacesRoutes.js"
import makeSeasonsRoutes from "./routes/makeSeasonsRoutes.js"
import makeSendRoutes from "./routes/makeSendRoute.js"
import makeSessionRoutes from "./routes/makeSessionRoutes.js"
import makeTeamsRoutes from "./routes/makeTeamsRoutes.js"
import makeUsersRoutes from "./routes/makeUsersRoutes.js"

const app = express()
const db = knex(config.db)

Model.knex(db)

app.use(cors())
app.use(express.json())

makeUsersRoutes({ app, db })
makeSessionRoutes({ app, db })
makeDriversRoutes({ app, db })
makeCommentsRoutes({ app, db })
makeCircuitsRoutes({ app, db })
makeSeasonsRoutes({ app, db })
makeRacesRoutes({ app, db })
makeSendRoutes({ app, db })
makeTeamsRoutes({ app, db })

app.listen(config.server.port, () =>
  // eslint-disable-next-line no-console
  console.log(`Listening on :${config.server.port}`)
)
