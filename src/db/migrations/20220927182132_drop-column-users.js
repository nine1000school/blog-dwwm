export const up = async (knex) => {
  await knex.schema.alterTable("races", (table) => {
    table.dropColumn("qualificationDate1")
    table.dropColumn("qualificationDuration1")
    table.dropColumn("qualificationDate2")
    table.dropColumn("qualificationDuration2")
    table.dropColumn("qualificationDate3")
    table.dropColumn("qualificationDuration3")
  })
}

export const down = async (knex) => {
  await knex.schema.alterTable("races", (table) => {
    table.dropColumn("qualificationDate1")
    table.dropColumn("qualificationDuration1")
    table.dropColumn("qualificationDate2")
    table.dropColumn("qualificationDuration2")
    table.dropColumn("qualificationDate3")
    table.dropColumn("qualificationDuration3")
  })
}
