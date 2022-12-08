export const up = async (knex) => {
  await knex.schema.createTable("news", (table) => {
    table.increments("id")
    table.text("title").notNullable()
    table.text("content").notNullable()
    table.integer("teamId").notNullable()
    table.timestamps(true, true, true)
  })
}

export const down = async (knex) => {
  await knex.schema.dropTable("news")
}
