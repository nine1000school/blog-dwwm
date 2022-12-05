import { ACL } from "../ACL"

const permission = (permit) => (req, res, next) => {
  const {
    session: {
      user: { role },
    }
  } = req

  const hasPermission = permit.reduce((hasPermission, permissionPath) => {
    if (!hasPermission) {
      return false
    }

    const permission = permissionPath
      .split(".")
      .reduce((xs, x) => xs[x], ACL[role])

    if (typeof permission !== "boolean") {
      res.status(500).send({ error: ["Oops. Something went wrong"] })

      console.error(`Wrong permission ${permissionPath}`)

      return
    }

    return permission
  }, true)

  if (!hasPermission) {
    res.status(403).send({ error: ["Forbidden."] })

    return
  }

  next()
}

export default permission
