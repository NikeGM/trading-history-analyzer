const WaitPosition = require('./states/wait-position');
const OpenPosition = require('./states/open-postion');
const ClosePosition = require('./states/close-position');
const StopLoss = require('./states/stop-loss');
const Position = require('./states/position');
const Window = require('../libs/window');
const Decimal = require('decimal.js');
const { Period } = require('../model/period');
const { EMA, MA } = require('../indicators');
const { container } = require('../service-container');

class Strategy {
  constructor(options) {
    const {
      capital, lotSize, maxLossPercentage, maxLossCount, from, to, period, correction, name, margin, sellField, buyField, interval,
      reverse, IField, IAverageParam, IName
    } = options;
    this.stats = {
      capitals: [],
      minCapital: { value: new Decimal(Infinity) },
      maxCapital: { value: new Decimal(0) },
      midCapital: 0,
      win: 0,
      loss: 0,
      winRanges: {},
      lossRanges: {},
      stopLossCount: 0,
      profits: [],
      midProfit: 0,
      maxProfit: 0,
      minProfit: 0
    };
    this.options = {
      capital: new Decimal(capital),
      lotSize: new Decimal(lotSize),
      maxLossPercentage: new Decimal(maxLossPercentage),
      maxLossCount: new Decimal(maxLossCount),
      correction: new Decimal(correction),
      margin: new Decimal(margin),
      period: new Period(period).seconds,
      averageParam: IAverageParam,
      field: IField,
      from, to, name, interval, reverse, buyField, sellField, IName
    };
    this.strategyState = {
      currentWinRange: 0,
      currentLossRange:0,
      intervalCounter: 0,
      capitals: [],
      currentCapital: new Decimal(this.options.capital),
      maxSingleLoss: new Decimal(1).minus(this.options.maxLossPercentage.pow(new Decimal(1).div(this.options.maxLossCount))),
      position: {
        size: new Decimal(0),
        type: '',
        price: new Decimal(0),
        stop: new Decimal(0),
        start: 0
      },
      candles: new Window(3, () => {}),
      indicators: new Window(3, () => {}),
      state: null
    };
    this.states = {
      waitPosition: new WaitPosition(this, 'waitPosition'),
      openPosition: new OpenPosition(this, 'openPosition'),
      closePosition: new ClosePosition(this, 'closePosition'),
      stopLoss: new StopLoss(this, 'stopLoss'),
      position: new Position(this, 'position')
    };
    this.setState('waitPosition');
  }

  setState(stateName, options) {
    this.strategyState.state = this.states[stateName];
    this.strategyState.state.init(options);
  }

  addStatsCapital(end) {
    const { strategyState, options: { capital, from }, stats } = this;
    const { capitals } = stats;
    const { currentCapital } = strategyState;

    const previousCapital = capitals[capitals.length - 1];
    const profitRate = currentCapital.div(capital);
    const start = previousCapital ? previousCapital.time.end : from;
    const newCapital = {
      value: currentCapital,
      time: { start, end },
      profitRate: profitRate,
      timeProfitRate: profitRate.mul(86400000 / (end - start))
    };
    capitals.push(newCapital);
    if (stats.maxCapital.value.lt(newCapital.value)) {
      stats.maxCapital = newCapital;
    }
    if (stats.minCapital.value.gt(newCapital.value)) {
      stats.minCapital = newCapital;
    }
  }

  onNewCandle(newCandle, newIndicator) {
    const { strategyState, options: { interval, capital } } = this;
    const { intervalCounter, candles, indicators, state } = strategyState;

    strategyState.intervalCounter++;
    if (intervalCounter > interval) {
      const end = newCandle.time;
      this.addStatsCapital(end);
      strategyState.currentCapital = new Decimal(capital);
      strategyState.intervalCounter = 0;
    }
    candles.add(newCandle);
    indicators.add(newIndicator);

    state.onNewCandle();
  }

  async run() {
    const { from, to, period, name, field, averageParam, IName } = this.options;
    const profits = this.stats.profits;
    const candles = await container.repository.getCandles(from, to, period, name);
    this.options.from = candles[0].time;
    this.options.to = candles[candles.length - 1].time + 1;
    let indicator;
    switch (IName) {
      case 'ma':
        indicator = await new MA({ from, to, period, name, averageParam, field });
        break;
      case 'ema':
        indicator = await new EMA({ from, to, period, name, averageParam, field });
        break;
      default:
        indicator = await new EMA({ from, to, period, name, averageParam, field });
    }
    const indicators = await indicator.calculateIndicator();

    candles.forEach((candle, index) => indicators[index] && this.onNewCandle(candle, indicators[index]));
    this.addStatsCapital(to);
    this.stats.midCapital = this.stats.capitals
      .reduce((res, cur) => res.plus(cur.value), new Decimal(0))
      .div(this.stats.capitals.length);
    this.stats.maxProfit = profits.reduce((max, cur) => max.gt(cur) ? max : cur, new Decimal(0));
    this.stats.minProfit = profits.reduce((min, cur) => min.lt(cur) ? min : cur, new Decimal(Infinity));
    this.stats.midProfit = profits.reduce((sum, cur) => sum.plus(cur), new Decimal(0)).div(profits.length);
    return this.stats;
  }
}

module.exports = Strategy;