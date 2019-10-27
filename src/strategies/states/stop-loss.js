const State = require('./state');
const Decimal = require('decimal.js');

class StopLoss extends State {
  constructor(strategy, name) {
    super(strategy, name);
  }

  onNewCandle() {
    this.strategy.stats.stopLossCount++;
    this.switchState();
    const { state } = this.strategy.strategyState;
    if (state.name === 'waitPosition') {
      state.onNewCandle();
    }
  }

  calculateStat() {
    const { strategyState, stats } = this.strategy;
    const { currentWinRange } = strategyState;
    if (currentWinRange === 0) {
      strategyState.currentLossRange++;
      stats.loss++;
    }
    if (currentWinRange > 0) {
      stats.loss++;
      strategyState.currentLossRange = 1;
      stats.winRanges[currentWinRange] = stats.winRanges[currentWinRange] ? stats.winRanges[currentWinRange] + 1 : 1;
      strategyState.currentWinRange = 0;
    }
  }

  toWaitPosition() {
    const { strategyState, stats } = this.strategy;
    const { position } = strategyState;
    const { price, size, type, stop } = position;
    this.calculateStat();
    let profit = null;
    if (type === 'short') {
      profit = price.minus(stop).mul(size);
    }
    if (type === 'long') {
      profit = stop.minus(price).mul(size);
    }
    stats.profits.push(profit);
    strategyState.position = {
      type: '',
      size: new Decimal(0),
      stop: new Decimal(0),
      price: new Decimal(0),
      start: 0
    };
    strategyState.currentCapital = strategyState.currentCapital.plus(profit);
    return !!profit;
  }
}

module.exports = StopLoss;