const State = require('./state');
const Decimal = require('decimal.js');

class ClosePosition extends State {
  constructor(strategy, name) {
    super(strategy, name);
  }

  onNewCandle() {
    this.switchState();
    const { state } = this.strategy.strategyState;
    if (state.name === 'openPosition') {
      state.onNewCandle();
    }
  }

  calculateStat(profit) {
    const { strategyState, stats } = this.strategy;
    const { currentLossRange, currentWinRange } = strategyState;
    if (profit.gt(0) && currentLossRange === 0) {
      strategyState.currentWinRange++;
      stats.win++;
    }
    if (profit.lte(0) && currentWinRange === 0) {
      strategyState.currentLossRange++;
      stats.loss++;
    }
    if (profit.gt(0) && currentLossRange > 0) {
      stats.win++;
      strategyState.currentWinRange = 1;
      stats.lossRanges[currentLossRange] = stats.lossRanges[currentLossRange] ? stats.lossRanges[currentLossRange] + 1 : 1;
      strategyState.currentLossRange = 0;
    }
    if (profit.lte(0) && currentWinRange > 0) {
      stats.loss++;
      strategyState.currentLossRange = 1;
      stats.winRanges[currentWinRange] = stats.winRanges[currentWinRange] ? stats.winRanges[currentWinRange] + 1 : 1;
      strategyState.currentWinRange = 0;
    }
  }

  toOpenPosition() {
    const { strategyState, options, stats } = this.strategy;
    const { candles, position, currentCapital } = strategyState;
    const { price, size, type } = position;
    let profit = null;
    if (type === 'short') {
      profit = price.minus(candles.items[0][options.sellField]).mul(size);
    }
    if (type === 'long') {
      profit = candles.items[0][options.buyField].minus(price).mul(size);
    }
    stats.profits.push(profit);
    strategyState.currentCapital = currentCapital.plus(profit);
    this.calculateStat(profit);
    strategyState.position = {
      type: '',
      size: new Decimal(0),
      stop: new Decimal(0),
      price: new Decimal(0),
      start: 0
    };
    return !!profit;
  }
}

module.exports = ClosePosition;