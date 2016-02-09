import Bluebird from 'bluebird';
import { OFFLINE_STATUS } from './constants';

export default function promiseMap(obj, fn) {
  return Bluebird.props(
    Object.keys(obj)
      .reduce((res, key) => {
        res[key] = fn(key)
          .reflect()
          .then(parseValue);
        return res;
      }, {})
  );
}

function parseValue(inspection) {

  if (inspection.isRejected()) {
    let value = inspection.reason() || 'Connection is unhealthy';
    return {
      status: OFFLINE_STATUS,
      value,
    };
  }

  if (inspection.isFulfilled()) {
    return inspection.value();
  }

}

