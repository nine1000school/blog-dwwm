import { HttpAccessError } from "../errors.js"

const hasAccess = (session, role) => {
  if (session?.user?.role === role) {
    return
  }

  throw new HttpAccessError()
}

export default hasAccess