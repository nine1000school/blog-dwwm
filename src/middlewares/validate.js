import * as yup from "yup"

const validate = (validators) => async (req, res, next) => {
  const validationSchema = yup.object().shape(validators)

  try {
    req.body = await validationSchema.validate(req.body, { abortEarly: false })
  } catch (err) {
    res.status(420).send({ error: err.errors })

    return
  }

  next()
}

export default validate
