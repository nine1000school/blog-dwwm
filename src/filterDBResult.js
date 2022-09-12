const hiddenFields = [
  "passwordHash",
  "passwordSalt",
  "email",
  "createdAt",
  "updatedAt",
]

const filterDBResult = (rows) =>
  rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).filter(([field]) => !hiddenFields.includes(field))
    )
  )

export default filterDBResult
