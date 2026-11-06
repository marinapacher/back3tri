exports.up = function (knex) {
  return knex.schema
    .createTable('clientes', (table) => {
      table.increments('id').primary();
      table.string('nome').notNullable();
      table.string('email').notNullable().unique();
      table.string('senha').notNullable();
      table.timestamps(true, true);
    })
    .createTable('produtos', (table) => {
      table.increments('id').primary();
      table.string('nome').notNullable();
      table.string('categoria').notNullable();
      table.decimal('preco', 10, 2).notNullable();
      table.text('descricao');
      table.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('produtos').dropTable('clientes');
};