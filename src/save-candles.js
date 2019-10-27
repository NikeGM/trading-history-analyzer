const { Period } = require('./model/period');
const config = require('config');
const { container } = require('./service-container');

const logger = container.loggerFactory.getLogger('SaveCandles');
const repository = container.repository;
const iteratorValues = config.parametrs;
const periods = iteratorValues.period.map(period => new Period(period));
const names = iteratorValues.name;
repository.candlesFromFileToDb(periods, names).then(() => {
  container.dbConnect.destroy();
  logger.info('Candles loaded');
});
