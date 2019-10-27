exports.up = async knex => {
    await knex.schema
      .createTable('analyze', table => {
          table.increments('id');
          table.integer('capital');
          table.integer('lot_size');
          table.float('max_loss_percentage');
          table.integer('max_loss_count');
          table.bigInteger('from');
          table.bigInteger('to');
          table.string('period');
          table.float('correction');
          table.string('name');
          table.float('margin');
          table.string('buy_field');
          table.string('sell_field');
          table.integer('interval');
          table.boolean('reverse');
          table.string('indicator_name');
          table.string('indicator_field');
          table.integer('indicator_average_param');

          table.float('max_capital');
          table.float('min_capital');
          table.float('mid_capital');
          table.integer('win');
          table.integer('loss');
          table.integer('stop_loss');
          table.json('win_ranges');
          table.integer('max_win_range');
          table.integer('max_loss_range');
          table.json('loss_ranges');
          table.json('profits');
          table.float('min_profit');
          table.float('max_profit');
          table.float('mid_profit');

          table.unique([
              'id', 'capital', 'lot_size', 'max_loss_percentage', 'max_loss_count', 'from', 'to', 'period', 'correction',
              'name', 'margin', 'buy_field', 'sell_field', 'interval', 'reverse', 'indicator_name', 'indicator_field', 'indicator_average_param'
          ])
      });
    return knex.schema
      .createTable('capitals', table => {
          table.increments('id');
          table.integer('analyze_id').notNullable();
          table.float('value').notNullable();
          table.bigInteger('start').notNullable();
          table.bigInteger('end').notNullable();
          table.float('profit_rate').notNullable();
          table.float('time_profit_rate').notNullable();

          table.unique(['analyze_id'])
      });
};

exports.down = knex => Promise.all([
  knex.schema.dropTable("analyze"),
  knex.schema.dropTable("capitals")
]);
