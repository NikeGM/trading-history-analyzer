const State = require('./state');
const Decimal = require('decimal.js');

class OpenPosition extends State {
  constructor(strategy, name) {
    super(strategy, name);
  }

  onNewCandle() {
    this.switchState();
    const { state } = this.strategy.strategyState;
    if (state.name === 'position') {
      state.onNewCandle();
    }
  }

  getOrderSum() {
    const { strategyState, options } = this.strategy;
    const { candles, currentCapital, maxSingleLoss } = strategyState;
    const { lotSize, margin, correction } = options;
    const count = Decimal.floor(maxSingleLoss.mul(currentCapital).div(correction));
    const orderSum = Decimal.floor(count.div(lotSize)).mul(lotSize);
    const price = orderSum.mul(candles.items[0].open);
    if (price.lt(currentCapital.mul(margin))) return orderSum;
    return Decimal.floor(currentCapital.mul(margin).div(candles.items[0].open).div(lotSize)).mul(lotSize);
  }

  toPosition() {
    const { strategyState, options: { correction, reverse, buyField, sellField } } = this.strategy;
    const { indicators, candles } = strategyState;

    if (indicators.items[2].value.gt(candles.items[2].open) && indicators.items[1].value.lt(candles.items[1].open)) {
      strategyState.position = {
        type: reverse ? 'long' : 'short',
        size: this.getOrderSum(),
        stop: reverse ? candles.items[0].open.minus(correction) : candles.items[0].open.plus(correction),
        price: reverse ? candles.items[0][sellField] : candles.items[0][buyField],
        start: candles.items[0].time
      };

      return true;
    }
    if (indicators.items[2].value.lt(candles.items[2].open) && indicators.items[1].value.gt(candles.items[1].open)) {
      strategyState.position = {
        type: reverse ? 'short' : 'long',
        size: this.getOrderSum(),
        stop: reverse ? candles.items[0].open.plus(correction) : candles.items[0].open.minus(correction),
        price: reverse ? candles.items[0][buyField] : candles.items[0][sellField],
        start: candles.items[0].time
      };

      return true;
    }
    return false;
  }
}

module.exports = OpenPosition;