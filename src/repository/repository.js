const config = require('config');
const { Candle } = require('../model/candle');
const fs = require('fs');
const readline = require('readline');

class Repository {
  constructor(logger, client, cache) {
    this.client = client;
    this.logger = logger;
    this.cache = cache;
  }

  async saveResults(options, data, existMap) {
    const existId = existMap[this.optionsToKey(options)];
    try {
      const analyzeId = await this.saveAnalyze(options, data, existId);
      return await this.saveCapitals(analyzeId, data.capitals, existId);
    } catch (e) {
      this.logger.error('Error while saving results', e, existId);
      return null;
    }
  }

  async saveAnalyze(options, data, existId) {
    const {
      capital, lotSize, maxLossPercentage, from, to, period, correction, name, margin, buyField, sellField,
      interval, reverse, IName, IField, IAverageParam, maxLossCount
    } = options;
    const {
      maxCapital, minCapital, midCapital, win, loss, stopLossCount, lossRanges, winRanges, profits, midProfit,
      maxProfit, minProfit
    } = data;
    const insertObject = {
      capital, from, to, period, correction, name, margin, interval, reverse,
      lot_size: lotSize,
      buy_field: buyField,
      sell_field: sellField,
      max_loss_count: maxLossCount,
      max_loss_percentage: maxLossPercentage,
      max_loss_range: Object.keys(lossRanges).reduce((max, cur) => max < cur ? cur : max, 0),
      max_win_range: Object.keys(winRanges).reduce((max, cur) => max < cur ? cur : max, 0),
      indicator_name: IName,
      indicator_field: IField,
      indicator_average_param: IAverageParam,
      win, loss,
      max_capital: +maxCapital.value,
      min_capital: +minCapital.value,
      mid_capital: +midCapital,
      stop_loss: stopLossCount,
      loss_ranges: lossRanges,
      win_ranges: winRanges,
      mid_profit: +midProfit,
      max_profit: +maxProfit,
      min_profit: +minProfit,
      profits: JSON.stringify(profits)
    };
    const result = existId ?
      await this.client('analyze').where('id', '=', existId).update(insertObject) :
      await this.client('analyze').insert(insertObject, ['id']);
    return existId || result[0].id;
  }

  async saveCapitals(analyzeId, capitals, existId) {
    const prepared = capitals.map(capital => ({
      analyze_id: analyzeId,
      value: +capital.value,
      start: capital.time.start,
      end: capital.time.end,
      profit_rate: +capital.profitRate,
      time_profit_rate: +capital.timeProfitRate
    }));
    if (existId) {
      await this.client('capitals')
        .where('analyze_id', analyzeId)
        .del();
    }
    const batch = [];
    const batchSize = config.output.batchSize;
    while (prepared.length) {
      while (batch.length < batchSize && prepared.length) {
        batch.push(prepared.pop());
      }
      await this.client('capitals').insert(batch);
      batch.length = 0;
    }
  }

  async loadCandles(periods, names) {
    for (let name of names) {
      for (let period of periods) {
        const key = `candles:${ name }:${ period.seconds }`;
        const hasKey = await this.cache.has(key);
        if (hasKey) return;
        try {
          const candles = await this.client.select()
            .from('candles')
            .where({ name, period: period.literal })
            .orderBy('time', 'asc');
           await this.cache.set(key, JSON.stringify(candles));
        } catch (e) {
          this.logger.error('Error while loading candles to cache.');
        }
      }
    }
    return null;
  }

  async getCandles(from, to, period, name) {
    const key = `candles:${ name }:${ period }`;
    const candles = JSON.parse(await this.cache.get(key))
      .filter(item => item.time >= from && item.time < to);
    return candles.map(dbCandle => {
      const candle = new Candle();
      candle.fromDb(dbCandle);
      return candle;
    });
  }

  async getExistMap() {
    try {
      const existRows = await this.client('analyze')
        .select(
          'id', 'capital', 'lot_size', 'max_loss_percentage', 'max_loss_count', 'from', 'to', 'period', 'correction',
          'name', 'margin', 'buy_field', 'sell_field', 'interval', 'reverse', 'indicator_name', 'indicator_field',
          'indicator_average_param'
        );
      const existMap = {};
      const fields = [
        'capital', 'lot_size', 'max_loss_percentage', 'max_loss_count', 'from', 'to', 'period', 'correction',
        'name', 'margin', 'buy_field', 'sell_field', 'interval', 'reverse', 'indicator_name', 'indicator_field',
        'indicator_average_param'
      ];
      existRows.forEach(row => {
        const key = fields.map(field => row[field]).join('_');
        existMap[key] = row.id;
      });
      return existMap;
    } catch (e) {
      this.logger.error('Error while loading existence map', e);
      return null;
    }
  }

  async saveOneCandleType(period, name) {
    let candles = [];
    try {
      candles = await this.loadOneCandleType(name, period);
    } catch (e) {
      this.logger.error('Error while loading candles form file', e, name, period);
    }
    const batch = [];
    while (candles.length) {
      while (batch.length < config.input.batchSize && candles.length) {
        batch.push(candles.pop());
      }
      this.logger.debug('Candles loaded', candles.length);
      try {
        const result = await this.client.insert(batch, ['id']).into('candles');
        this.logger.debug(result.length);
      } catch (e) {
        this.logger.error('Error while saving candles', e, period, name);
      }
      batch.length = 0;
    }
    return null;
  }

  async candlesFromFileToDb(periods, names) {
    for (let name of names) {
      for (let period of periods) {
        await this.saveOneCandleType(period, name);
      }
    }
    return null;
  }

  optionsToKey(options) {
    const fields = [
      'capital', 'lotSize', 'maxLossPercentage', 'maxLossCount', 'from', 'to', 'period', 'correction',
      'name', 'margin', 'buyField', 'sellField', 'interval', 'reverse', 'IName', 'IField', 'IAverageParam'
    ];
    return fields.map(field => options[field]).join('_');
  }

  loadOneCandleType(name, period) {
    return new Promise(res => {
      const results = [];
      const readInterface = readline.createInterface({
        input: fs.createReadStream(`./data/${ name }_${ period.literal }.csv`),
        console: false
      });
      let line = 0;

      readInterface
        .on('line', data => {
          line++;
          if (line % 100000 === 0) this.logger.debug(line, data);
          const candle = new Candle();
          candle.fromString(data, period, name);
          results.push(candle.toDb());
        })
        .on('close', () => res(results));
    });
  }
}

module.exports = { Repository };