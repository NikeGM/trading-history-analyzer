exports.up = knex =>
  knex.schema
    .createTable('candles', table => {
      table.increments('id');
      table.string('name').notNullable();
      table.string('period').notNullable();
      table.bigInteger('time').notNullable();
      table.timestamp('date').notNullable();
      table.float('open').notNullable();
      table.float('high').notNullable();
      table.float('low').notNullable();
      table.float('close').notNullable();
      table.float('volume').notNullable();
      table.float('midOC').notNullable();
      table.float('midHL').notNullable();
      table.float('midOHLC').notNullable();

      table.unique(['period', 'time'])
    });

exports.down = knex => knex.schema.dropTable("candles");
