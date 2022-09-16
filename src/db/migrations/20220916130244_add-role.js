export const up = async (knex) => {
  await knex.schema.alterTable("users", (table) => {
    table.text("role").notNullable().default("USER")
  })
}

export const down = async (knex) => {
  await knex.schema.alterTable("users", (table) => {
    table.dropCollum("role")
  })
}
