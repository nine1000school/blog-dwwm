import * as yup from "yup"
import config from "./config.js"

export const validateEmail = yup.string().email().trim().label("E-mail")

export const validatePassword = yup
  .string()
  .min(8)
  .matches(/\W/, "Password must contain at least a special character")
  .label("Password")

export const validateUsername = yup
  .string()
  .min(2)
  .max(15)
  .matches(
    /^[a-z][a-z0-9._]*/,
    "Username must contain only letters, numbers, '.' and '_'"
  )
  .trim()
  .label("Username")

export const validateDisplayName = yup
  .string()
  .min(1)
  .max(20)
  .trim()
  .matches(/[^\n\r\u00a0]/)
  .label("Display Name")

export const validateLimit = yup
  .number()
  .min(config.view.results.minLimit)
  .max(config.view.results.maxLimit)
  .integer()
  .default(config.view.results.defaultLimit)
  .label("Pagination limit")

export const validateOffset = yup
  .number()
  .min(0)
  .integer()
  .default(0)
  .label("Pagination offset")

export const validateId = yup.number().integer().min(1).label("ID")

export const validateEmailOrUsername = yup
  .string()
  .min(2)
  .trim()
  .label("Email or Username")

export const validateContent = yup.string().min(1).label("Content")

export const validatePostTitle = yup.string().min(1).label("Title")

export const validatePostContent = validateContent.label("Post content")

export const validatePublishedAt = yup.date().label("Publishing date")

export const validateSearch = yup.string().min(3).label("Search terms")

export const validateCommentContent = validateContent.label("Comment content")

export const validateLocation = yup.string().min(2).label("Localisation of race")
export const validateDate = yup.date().label("Race date")
export const validateRaceName = yup.string().min(3).label("Race name")
export const validateRole = yup.string().min(4).label("Role")
export const validateTeamName = yup.string().min(4).label("Team Name")
export const validateNationnality = yup.string().min(4).label("Nationnality")
export const validateSeasonName = yup.string().min(4).label("Season Name")
export const validateDriverName = yup.string().min(4).label("Driver Name")
export const validateCircuitName = yup.string().min(4).label("Circuit Name")
export const validateLength = yup.number().min(1).label("Circuit Length")
export const validateTurnNumbers = yup.number().min(1).label("Number of turn")
export const validateEventPoint = yup.string().min(4).label("Event's Point")
export const validateEventPenalty = yup.string().min(4).label("Event's penalty")
export const validateEventAbord = yup.string().min(4).label("Event's abord")
export const validateEventCrash = yup.string().min(4).label("Event's crash")
export const validateEventPuncture = yup.string().min(4).label("Event's puncture")