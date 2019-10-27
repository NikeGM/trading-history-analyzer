const literalToSeconds = {
  m1: 60,
  m5: 300,
  m10: 600,
  m15: 900,
  m30: 1800,
  h1: 3600,
  d1: 86400
};


class Period {
  constructor(period) {
    this._literal = typeof period === 'number' ?
      Object.entries(literalToSeconds).find(pair => pair[1] === period)[0] :
      period;
    this._seconds = typeof period === 'string' ? literalToSeconds[period] : period;
  }

  get literal() {
    return this._literal;
  }

  get seconds() {
    return this._seconds;
  }
}

module.exports = { Period };
