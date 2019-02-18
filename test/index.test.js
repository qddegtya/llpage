const { createLLPageManager, createPage } = require("../lib/index");

describe("page operations", () => {
  let ll;

  beforeAll(() => {
    ll = createLLPageManager({
      size: 5
    });
  });

  test("open a new page with empty", () => {});
});
