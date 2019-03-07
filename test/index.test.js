const { createLLPageManager, createPage } = require("../src");
import { functional } from "xajs";

const pageFactory = data =>
  createPage({
    data,

    async onCreate() {},

    async onStart() {},

    async onPause() {},

    async onDestroy() {},

    async onRestart() {},

    async onResume() {},

    async onStop() {}
  });

describe("page operations", () => {
  let ll, pages;
  const mockLifeCycleFn = jest.fn(() => Promise.resolve());
  const TEST_LL_SIZE = 3;

  beforeAll(() => {
    ll = createLLPageManager({
      size: TEST_LL_SIZE
    });

    pages = Array.apply(null, { length: TEST_LL_SIZE + 1 })
      .fill({
        userName: "xiaoa"
      })
      .map(d => pageFactory(d))
      .map(p => {
        // mock lifecycle here
        p.hooks.onCreate = mockLifeCycleFn;
        p.hooks.onStart = mockLifeCycleFn;
        p.hooks.onPause = mockLifeCycleFn;
        p.hooks.onDestroy = mockLifeCycleFn;
        p.hooks.onRestart = mockLifeCycleFn;
        p.hooks.onResume = mockLifeCycleFn;
        p.hooks.onStop = mockLifeCycleFn;

        return p;
      });
  });

  test("page instance check", () => {
    expect(() => {
      ll.open({});
    }).toThrowError(/page must be instanceof/);
  });

  // 空队列状态开启一个新页面
  test("open new page with empty status", async () => {
    const _page0 = pages[0];
    const _page1 = pages[1];

    // ====== 1s 后打开 page 0 ======
    await functional.helper.sleep(1000);
    ll.open(_page0);

    expect(ll.lruMap.size).toBe(1);
    expect(_page0.isRunning).toBe(true);

    // _page 0 触发 CSR
    expect(_page0.hooks.onCreate).toBeCalled();
    expect(_page0.hooks.onStart).toBeCalled();
    expect(_page0.hooks.onResume).toBeCalled();

    // ====== 1s 后打开 page 1 ======
    await functional.helper.sleep(1000);
    ll.open(_page1);

    expect(ll.lruMap.size).toBe(2);
    expect(_page0.isRunning).toBe(false);
    expect(_page1.isRunning).toBe(true);

    // _page 1 触发 CSR, _page 0 触发 onPause
    expect(_page0.hooks.onPause).toBeCalled();

    expect(_page1.hooks.onCreate).toBeCalled();
    expect(_page1.hooks.onStart).toBeCalled();
    expect(_page1.hooks.onResume).toBeCalled();
  });

  // 打开一个已经存在的页面
  test("open exist page", async () => {
    const _page0 = pages[0];
    const _page1 = pages[1];

    // ====== 1s 后重新打开页面 0 ======
    await functional.helper.sleep(1000);
    ll.open(_page0);

    expect(ll.lruMap.size).toBe(2);
    expect(_page0.isRunning).toBe(true);
    expect(ll.lruMap.get("llpage-1")).toBe(_page0);

    expect(_page1.hooks.onPause).toBeCalled();
    expect(_page0.hooks.onResume).toBeCalled();
  });

  // 关闭页面
  test("close page", async () => {
    const _page2 = pages[2];

    // ====== 1s 后关闭页面 2 ======
    await functional.helper.sleep(1000);
    ll.open(_page2);

    // ====== 1s 后关闭页面 2 ======
    await functional.helper.sleep(1000);
    ll.close(_page2);

    expect(_page2.hooks.onStop).toBeCalled();
    expect(_page2.hooks.onDestroy).toBeCalled();

    // ====== 1s 后重新打开 2 ======
    ll.open(_page2);
  });

  test("open new page with full status", async () => {
    const _page3 = pages[3];
    const _oldestPage = ll.lruMap.oldest.value;

    // ====== 1s 后打开页面 3 ======
    await functional.helper.sleep(1000);
    ll.open(_page3);

    expect(ll.lruMap.size).toBe(TEST_LL_SIZE);

    expect(_oldestPage).toBe(pages[1]);
    expect(_oldestPage.hooks.onStop).toBeCalled();
    expect(_oldestPage.hooks.onDestroy).toBeCalled();
  });

  // 关闭其他页面
  test("close other pages", async () => {
    const _page = pages[0];
    const _page2 = pages[2];
    const _page3 = pages[3];

    // ====== 1s 后关闭除第一个外的其他页面 ======
    await functional.helper.sleep(1000);
    ll.closeOthers(_page);

    expect(_page.isRunning).toBe(true);
    expect(ll.lruMap.size).toBe(1);

    expect(_page2.hooks.onStop).toBeCalled();
    expect(_page2.hooks.onDestroy).toBeCalled();

    expect(_page3.hooks.onStop).toBeCalled();
    expect(_page3.hooks.onDestroy).toBeCalled();

    expect(_page.hooks.onResume).toBeCalled();
  });

  // 关闭其他页面
  test("close all pages", () => {
    const _page = pages[0];
    ll.closeAll(_page);

    expect(ll.runningPage).toBe(null);
    expect(ll.lruMap.size).toBe(0);

    expect(_page.hooks.onStop).toBeCalled();
    expect(_page.hooks.onDestroy).toBeCalled();
  });

  afterAll(() => {
    ll = null;
    pages = null;
  });
});
