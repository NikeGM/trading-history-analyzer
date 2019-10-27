const State = require('./state');
const Decimal = require('decimal.js');

class Position extends State {
  constructor(strategy, name) {
    super(strategy, name);
  }

  onNewCandle() {
    this.switchState();
    const { state } = this.strategy.strategyState;
    if (state.name === 'stopLoss') {
      state.onNewCandle();
    }
  }

  toClosePosition() {
    return this.detectSignal();
  }

  toStopLoss() {
    const { strategyState } = this.strategy;
    const { candles } = strategyState;
    const longStopTriggered = strategyState.position.stop.gt(Decimal.min(candles.items[0].low, candles.items[1].low));
    const shortStopTriggered = strategyState.position.stop.lt(Decimal.max(candles.items[0].high, candles.items[1].high));
    if (strategyState.position.type === 'long' && longStopTriggered) return true;
    if (strategyState.position.type === 'short' && shortStopTriggered) return true;
    return false;
  }
}

module.exports = Position;