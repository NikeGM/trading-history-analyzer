const Strategy = require('./strategies/strategy');
const { Period } = require('./model/period');
const config = require('config');
const { container } = require('./service-container');
const logger = container.loggerFactory.getLogger('App');

const run = async () => {
  const repository = container.repository;
  const iteratorValues = config.parametrs;
  const iteratorFields = Object.keys(iteratorValues);

  iteratorValues.from = iteratorValues.from.map(date => new Date(date).getTime());
  iteratorValues.to = iteratorValues.to.map(date => new Date(date).getTime());

  try {
    await repository.loadCandles(
      iteratorValues.period.map(period => new Period(period)),
      iteratorValues.name
    );
  } catch (e) {
    logger.error('Error while loading candles to cache', e);
  }

  const optionsArray = { 0: [{}] };
  iteratorFields.forEach((field, index) => {
    optionsArray[index + 1] = [];
    iteratorValues[field].forEach(IValue => {
      optionsArray[index].forEach(prev => {
        const copy = { ...prev };
        copy[field] = IValue;
        optionsArray[index + 1].push(copy);
      });
    });
  });

  const existMap = await repository.getExistMap();
  for (let options of optionsArray[iteratorFields.length]) {
    const key = repository.optionsToKey(options);
    if (!existMap[key]) {
      const strategy = new Strategy(options);
      try {
        logger.info('Start strategy', key);
        const result = await strategy.run();
        await repository.saveResults(options, result, existMap);
        logger.info('End strategy', key);
      } catch (e) {
        logger.error('Error while running strategy', e, key);
      }
    }
  }
};

run().then();