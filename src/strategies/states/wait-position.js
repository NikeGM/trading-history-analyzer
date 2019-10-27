const State = require('./state');

class WaitPosition extends State {
  constructor(strategy, name) {
    super(strategy, name);
  }

  toOpenPosition() {
    const { strategyState: { indicators } } = this.strategy;
    if (!indicators.items[1] || !indicators.items[0]) return false;
    return this.detectSignal();
  }
}

module.exports = WaitPosition;