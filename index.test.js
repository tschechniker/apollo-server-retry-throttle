const SwapiDataSource = require("./SwapiDataSource");
jest.mock("node-fetch", () => require("fetch-mock").sandbox());
const fetchMock = require("node-fetch");

const URL = "https://testing-retry.com";

describe("fetches", () => {
  beforeEach(() => {
    fetchMock.reset();
    fetchMock.get(URL, { status: 200, body: 43 });
  });

  const initMut = () => {
    const ds = new SwapiDataSource();
    ds.initialize({ reliability: 1 }, fetchMock);
    return ds;
  };

  it("should be retried", async () => {
    fetchMock.get(
      URL,
      { throws: new Error("ENOTFOUND") },
      { overwriteRoutes: true }
    );

    try {
      await initMut().get(URL);
      fail("should throw exception after 3 retries");
    } catch (e) {
      expect(fetchMock._calls.length).toEqual(3);
    }
  });

  it("should not be retried on 404 (not found)", async () => {
    fetchMock.get(URL, 404, { overwriteRoutes: true });

    try {
      await initMut().get(URL);
      fail("should throw exception");
    } catch (e) {
      expect(fetchMock._calls.length).toEqual(1);
    }
  });
});
