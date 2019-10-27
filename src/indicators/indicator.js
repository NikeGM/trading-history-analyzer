const Decimal = require('decimal.js');
const { container } = require('../service-container');

class Indicator {
  // from, to, period, name, field
  constructor(params) {
    this.params = params;
  }

  getCandles() {
    const { from, to, period, name } = this.params;
    return container.repository.getCandles(from, to, period, name);
  }

  getKeyPrefix() {
    const { period, name, field } = this.params;
    return `${ name }_${ period }_${ field }`;
  }

  async getFromCache() {
    const { from, to } = this.params;
    const key = this.getKey();
    const hasKey = await container.cache.has(key);

    if (!hasKey) return null;

    const cached = JSON.parse(await container.cache.get(key));
    return cached
      .filter(item => item ? item.time >= from && item.time <= to : true)
      .map(item => item && { time: item.time, value: new Decimal(item.value), date: item.date });
  }

  getKey() {}

  calculateIndicator() {}

  async calculate() {
    const { from, to } = this.params;
    const cached = this.getFromCache();

    if (cached) return cached;

    const calculatedIndicator = this.calculateIndicator();
    await container.cache.set(this.getKey(), JSON.stringify(calculatedIndicator));
    return calculatedIndicator.filter(item => item ? item.time >= from && item.time <= to : true);
  }
}

module.exports = { Indicator };