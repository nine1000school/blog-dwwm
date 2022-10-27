import cors from "cors"
import express from "express"
import knex from "knex"
import { Model } from "objection"
import config from "./config.js"
import makeCircuitsRoutes from "./routes/makeCircuitsRoutes.js"
import makeCommentsRoutes from "./routes/makeCommentsRoutes.js"
import makePostsRoutes from "./routes/makePostsRoutes.js"
import makeRacesRoutes from "./routes/makeRacesRoutes.js"
import makeSeasonsRoutes from "./routes/makeSeasonsRoutes.js"
import makeSessionRoutes from "./routes/makeSessionRoutes.js"
import makeUsersRoutes from "./routes/makeUsersRoutes.js"

const app = express()
const db = knex(config.db)

Model.knex(db)

app.use(cors())
app.use(express.json())

makeUsersRoutes({ app, db })
makeSessionRoutes({ app, db })
makePostsRoutes({ app, db })
makeCommentsRoutes({ app, db })
makeCircuitsRoutes({ app, db })
makeSeasonsRoutes({ app, db })
makeRacesRoutes({ app, db })

app.listen(config.server.port, () =>
  // eslint-disable-next-line no-console
  console.log(`Listening on :${config.server.port}`)
)
