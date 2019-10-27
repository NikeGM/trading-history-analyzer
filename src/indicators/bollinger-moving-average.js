
const { Indicator } = require('./indicator');
const { MA, EMA } = require('./');

class BMA extends Indicator {
  // from, to, period, name, field, averageParam, base
  constructor(params) {
    super(params);
  }

  getKey() {
    const { averageParam, base } = this.params;
    return `${ this.getKeyPrefix() }_${ averageParam }_${ base }_bma`;
  }

  executor(items, previousResult, deletedValue, addedValue, size) {

  }

  async calculateIndicator() {

  }
}

module.exports = BMA;