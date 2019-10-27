class State {
  constructor(strategy, name) {
    this.strategy = strategy;
    this.name = name;
  }

  onNewCandle() {
    this.switchState();
  }


  toStop() {
    return false;
  }

  toClosePosition() {
    return false;
  }

 toPosition() {
   return false;
 }

  toOpenPosition() {
    return false;
  }

  toStopLoss() {
    return false;
  }

  toWaitPosition() {
    return false;
  }

  init() {}

  detectSignal() {
      const { strategyState: { candles, indicators } } = this.strategy;
      if (indicators.items[1].value.gt(candles.items[1].open) && indicators.items[0].value.lt(candles.items[0].open)) {
          return true;
      }
      if (indicators.items[1].value.lt(candles.items[1].open) && indicators.items[0].value.gt(candles.items[0].open)) {
          return true;
      }
      return false;
  }

  switchState() {
    const toStop = this.toStop();
    const toPosition = this.toPosition();
    const toStopLoss = this.toStopLoss();
    const toOpenPosition = this.toOpenPosition();
    const toClosePosition = this.toClosePosition();
    const toWaitPosition = this.toWaitPosition();
    if (this.toStop()) {
      return this.strategy.setState('stop', toStop);
    } else if (toStopLoss) {
      return this.strategy.setState('stopLoss', toStopLoss);
    } else if (toWaitPosition) {
      return this.strategy.setState('waitPosition', toWaitPosition);
    } else if (toClosePosition) {
      return this.strategy.setState('closePosition', toClosePosition);
    } else if (toOpenPosition) {
      return this.strategy.setState('openPosition', toOpenPosition);
    } else if (toPosition) {
      return this.strategy.setState('position', toPosition);
    }
    return false;
  }
}

module.exports = State;
