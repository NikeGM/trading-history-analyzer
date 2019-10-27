const Decimal = require('decimal.js');
const { Indicator } = require('./indicator');

class EMA extends Indicator {
  // from, to, period, name, field, averageParam
  constructor(params) {
    super(params);
    this.previous = 0;
  }

  getKey() {
    return `${ this.getKeyPrefix() }_${ this.params.averageParam }_ema`;
  }

  async calculateIndicator() {
    const { field, averageParam } = this.params;
    const candles = await this.getCandles();
    return candles.map(candle => {
      const alpha = new Decimal(1).div(new Decimal(1).plus(averageParam));
      this.previous = alpha.mul(candle[field]).plus(new Decimal(1).minus(alpha).mul(this.previous));
      return { value: this.previous, time: candle.time };
    });
  }
}

module.exports = { EMA };