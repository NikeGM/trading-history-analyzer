const { Period } = require('./period');
const Decimal = require('decimal.js');

class Candle {
  get open() {
    return this._open;
  }

  get close() {
    return this._close;
  }

  get high() {
    return this._high;
  }

  get low() {
    return this._low;
  }

  get volume() {
    return this._volume;
  }

  get midOC() {
    return this.open.plus(this.close).div(2);
  }

  get midHL() {
    return this.high.plus(this.low).div(2);
  }

  get midOHLC() {
    return this.high.plus(this.low).plus(this.open).plus(this.close).div(4);
  }

  get time() {
    return this._date.getTime();
  }

  get date() {
    return this._date;
  }

  get period() {
    return this._period;
  }

  get name() {
    return this._name;
  }

  formatTimestamp(ts) {
    const parsed = ts.split('.');
    return new Date(`${parsed[0]}.${parsed[1]}.${parsed[2]} ${parsed[3]}:${parsed[4]}:${parsed[5]}`);
  }

  fromDb(candle) {
    this._date = new Date(candle.date);
    this._open = new Decimal(candle.open);
    this._high = new Decimal(candle.high);
    this._low = new Decimal(candle.low);
    this._close = new Decimal(candle.close);
    this._volume = new Decimal(candle.volume);
    this._period = new Period(candle.period);
    this._name = candle.name;
  }

  toDb() {
    return {
      open: +this.open,
      high: +this.high,
      low: +this.low,
      close: +this.close,
      volume: +this.volume,
      midOC: +this.midOC,
      midHL: +this.midHL,
      midOHLC: +this.midOHLC,
      time: this.time,
      date: this._date.toLocaleString(),
      period: this.period.literal,
      name: this.name
    };
  }

  fromString(data, period, name) {
    const parsed = data.split(';');
    this._date = this.formatTimestamp(parsed[0]);
    this._open = new Decimal(parsed[1]);
    this._high = new Decimal(parsed[2]);
    this._low = new Decimal(parsed[3]);
    this._close = new Decimal(parsed[4]);
    this._volume = new Decimal(parsed[5]);
    this._period = period;
    this._name = name;
  }
}

module.exports = { Candle };