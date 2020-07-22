import { RESTDataSource } from "apollo-datasource-rest";
import { HTTPCache } from "apollo-datasource-rest";
import { RequestInit, URLSearchParamsInit } from "apollo-server-env";
import pThrottle from "p-throttle";
import { DataSourceConfig } from "apollo-datasource";
import { fetch } from "apollo-server-env";

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
export abstract class ThrottledRESTDataSource<
  TContext = any
> extends RESTDataSource {
  throttleLimit = 1;
  // in milliseconds
  throttleInterval = 1000;

  enableRequestTracing = false;

  private throttleFunction;

  initialize(
    config: DataSourceConfig<TContext>,
    httpFetch: typeof fetch = fetch
  ): void {
    super.initialize(config);
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    // need to overwrite fetch for testing purposes
    this.httpCache = new HTTPCache(config.cache, httpFetch);

    this.throttleFunction = pThrottle(
      (
        init: RequestInit & {
          path: string;
          params?: URLSearchParamsInit;
        }
      ) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        // need to overwrite private fetch here.
        return Promise.resolve(super.fetch(init));
      },
      this.throttleLimit,
      this.throttleInterval
    );
  }

  private async fetch<TResult>(
    init: RequestInit & {
      path: string;
      params?: URLSearchParamsInit;
    }
  ): Promise<TResult> {
    return this.throttleFunction(init);
  }
}
