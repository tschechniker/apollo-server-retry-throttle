const { RESTDataSource } = require("apollo-datasource-rest");
const { HTTPCache } = require("apollo-datasource-rest");
const { fetch } = require("apollo-server-env");

function retry(operation, times, url) {
  return new Promise((resolve, reject) => {
    return operation()
      .then(resolve)
      .catch(reason => {
        if (times - 1 > 0) {
          console.log(
            `${url} retrying... ${times - 1} attempt(s) to go. Reason:'`,
            reason
          );
          return retry(operation, times - 1, url)
            .then(resolve)
            .catch(reject);
        }
        return reject(reason);
      });
  });
}

/**
 * Simulates network errors
 * @param {float with value from 0...1} reliablity
 * @param {function to execute/fail} fn
 */
function fail(reliablity, fn) {
  return fn().then(r => {
    if (Math.random() > reliablity) throw new Error("BAM!");
    return r;
  });
}

function measurePromise(label, fn) {
  const start = Date.now();
  const onPromiseDone = r => {
    console.log(`${label} (${Date.now() - start}ms)`);
    return r;
  };
  return fn()
    .then(onPromiseDone)
    .catch(e => {
      console.error(`${label} (${Date.now() - start}ms)`, e);
      throw e;
    });
}

class SwapiDataSource extends RESTDataSource {
  initialize(config, httpFetch = fetch) {
    super.initialize(config);
    const unreliableFetch = (input, init) =>
      fail(config.reliability || 0.8, () => httpFetch(input, init));
    const retryingFetch = (input, init) =>
      retry(() => unreliableFetch(input, init), 3, input.url);
    const measuredFetch = (input, init) =>
      measurePromise(input.url, () => retryingFetch(input, init));
    this.httpCache = new HTTPCache(config.cache, measuredFetch);
  }
  getCharacter(id) {
    return this.get("http://swapi.dev/api/people/" + id);
  }
}

module.exports = SwapiDataSource;
