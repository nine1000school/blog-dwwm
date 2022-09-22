import cors from "cors"
import express from "express"
import knex from "knex"
import { Model } from "objection"
import config from "./config.js"
import handleErrrors from "./middlewares/handleErrors.js"
import makeCommentsRoutes from "./routes/makeCommentsRoutes.js"
import makePostsRoutes from "./routes/makePostsRoutes.js"
import makeSessionRoutes from "./routes/makeSessionRoutes.js"
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

app.get("/products/:productId", (req, res) =>
  res.send(`Product #${req.params.productId}`)
)
app.get("/categories/:categoryId/products/:productId", (req, res) =>
  res.send(
    `Category #${req.params.categoryId} Product #${req.params.productId}`
  )
)

makeUsersRoutes({ app, db })
makeSessionRoutes({ app, db })
makePostsRoutes({ app, db })
makeCommentsRoutes({ app, db })

app.use(handleErrrors)

app.listen(config.server.port, () =>
  // eslint-disable-next-line no-console
  console.log(`Listening on :${config.server.port}`)
)
