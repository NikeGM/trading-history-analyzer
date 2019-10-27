const Window = require('../libs/window');
const { Indicator } = require('./indicator');
const Decimal = require('decimal.js');

class MA extends Indicator {
  // from, to, period, name, field, averageParam
  constructor(params) {
    super(params);
  }

  getKey() {
    return `${ this.getKeyPrefix() }_${ this.params.averageParam }_ma`;
  }

  executor(items, previousResult, deletedValue, addedValue, size) {
    return {
      time: items[0].time,
      date: new Date(+items[0].time).toLocaleString(),
      value: previousResult ?
        previousResult.value.minus(deletedValue.value.div(size)).plus(addedValue.value.div(size)) :
        items.reduce((res, cur) => res.plus(cur.value), new Decimal(0)).div(items.length)
    };
  }

  async calculateIndicator() {
    const { averageParam, field } = this.params;
    const window = new Window(averageParam, this.executor);
    const candles = await this.getCandles();
    return candles.map(candle => window.execute({ time: candle.time, value: candle[field] }));
  }
}

module.exports = { MA };