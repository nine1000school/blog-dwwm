export const send500 = (res) =>
  res.status(500).send({ error: ["Oops. Something went wrong."] })

export const send401 = (res) =>
  res.status(401).send({ error: ["Invalid credentials."] })

export const send403 = (res) => res.status(403).send({ error: ["Forbidden."] })

export const send404 = (res, resource) =>
  res.status(404).send({ error: [`${resource} not found.`] })
