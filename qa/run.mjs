// QA 점검 스크립트. 사용법은 qa/README.md 참고.
import { chromium, webkit } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "out");

const VIEWPORTS = {
  "1440x900": { width: 1440, height: 900 },
  "1024x768": { width: 1024, height: 768 },
  "390x844": { width: 390, height: 844, mobile: true },
};
const ENGINES = { chromium, webkit };

function parseArgs(argv) {
  const opts = {
    url: [],
    viewport: Object.keys(VIEWPORTS),
    browser: Object.keys(ENGINES),
    scroll: [0, 0.5, 1],
    click: [],
    expect: [],
    motion: ["no-preference", "reduce"],
    settle: 800,
  };
  const list = (v) => v.split(",").map((s) => s.trim()).filter(Boolean);
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const val = argv[i + 1];
    if (!key.startsWith("--") || val === undefined) {
      throw new Error(`잘못된 인자: ${key}`);
    }
    i += 1;
    switch (key) {
      case "--url": opts.url = list(val); break;
      case "--viewport": opts.viewport = list(val); break;
      case "--browser": opts.browser = list(val); break;
      case "--scroll": opts.scroll = list(val).map(Number); break;
      // 셀렉터에 쉼표가 들어갈 수 있어 구분자는 ||
      case "--click": opts.click = val.split("||").map((s) => s.trim()).filter(Boolean); break;
      case "--expect": opts.expect = val.split("||").map((s) => s.trim()).filter(Boolean); break;
      case "--motion": opts.motion = list(val); break;
      case "--settle": opts.settle = Number(val); break;
      default: throw new Error(`알 수 없는 옵션: ${key}`);
    }
  }
  if (opts.url.length === 0) throw new Error("--url 은 필수");
  for (const v of opts.viewport) if (!VIEWPORTS[v]) throw new Error(`알 수 없는 뷰포트: ${v}`);
  for (const b of opts.browser) if (!ENGINES[b]) throw new Error(`알 수 없는 브라우저: ${b}`);
  for (const m of opts.motion) if (m !== "reduce" && m !== "no-preference") throw new Error(`알 수 없는 motion: ${m}`);
  if (opts.scroll.some((r) => Number.isNaN(r) || r < 0 || r > 1)) throw new Error("--scroll 은 0~1 사이 숫자");
  return opts;
}

const slug = (s) => s.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "root";
const pct = (r) => `${Math.round(r * 100)}`.padStart(3, "0");

// 기대 상태 형식: "셀렉터@속성=값" (속성이 없으면 "셀렉터@aria-current=값")
async function checkExpect(page, spec) {
  const m = spec.match(/^(.*)@([^=]+)=(.*)$/);
  if (!m) return { spec, ok: false, actual: "형식 오류 (셀렉터@속성=값)" };
  const [, selector, attr, expected] = m;
  const loc = page.locator(selector).first();
  if ((await loc.count()) === 0) return { spec, ok: false, actual: "요소 없음" };
  const actual = await loc.getAttribute(attr);
  return { spec, ok: actual === expected, actual };
}

async function runCase(browser, engineName, vpName, url, motion, opts) {
  const vp = VIEWPORTS[vpName];
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: Boolean(vp.mobile),
    hasTouch: Boolean(vp.mobile),
    deviceScaleFactor: vp.mobile ? 2 : 1,
    reducedMotion: motion,
  });
  const page = await context.newPage();
  const res = {
    browser: engineName, viewport: vpName, url, motion,
    console: [], failedRequests: [], shots: [], scrolls: [], clicks: [], expects: [],
    status: null, metrics: null, error: null,
  };

  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      res.console.push({ type: msg.type(), text: msg.text() });
    }
  });
  page.on("pageerror", (err) => res.console.push({ type: "pageerror", text: err.message }));
  page.on("requestfailed", (req) => {
    res.failedRequests.push({ url: req.url(), reason: req.failure()?.errorText ?? "unknown" });
  });
  page.on("response", (r) => {
    if (r.status() >= 400) res.failedRequests.push({ url: r.url(), reason: `HTTP ${r.status()}` });
  });

  const base = `${engineName}_${vpName}_${slug(url)}_${motion === "reduce" ? "reduce" : "normal"}`;
  const shot = async (suffix) => {
    const file = join(OUT_DIR, `${base}_${suffix}.png`);
    await page.screenshot({ path: file });
    res.shots.push(file);
    return file;
  };

  try {
    const response = await page.goto(url, { waitUntil: "load" });
    res.status = response?.status() ?? null;
    await page.waitForTimeout(opts.settle);
    res.metrics = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
    }));

    for (const ratio of opts.scroll) {
      const target = await page.evaluate((r) => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const top = Math.round(Math.max(0, max) * r);
        window.scrollTo({ top, behavior: "instant" });
        return top;
      }, ratio);
      await page.waitForTimeout(opts.settle);
      const actual = await page.evaluate(() => Math.round(window.scrollY));
      res.scrolls.push({ ratio, target, actual, shot: await shot(`scroll${pct(ratio)}`) });
    }

    for (const [idx, selector] of opts.click.entries()) {
      const entry = { selector, ok: false };
      try {
        await page.locator(selector).first().click({ timeout: 5000 });
        await page.waitForTimeout(opts.settle + 700);
        Object.assign(entry, await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          return {
            scrollY: Math.round(window.scrollY),
            hash: location.hash,
            pathname: location.pathname,
            clickedAriaCurrent: el ? el.getAttribute("aria-current") : null,
            allAriaCurrent: [...document.querySelectorAll("[aria-current]")].map((e) => ({
              tag: e.tagName.toLowerCase(),
              text: (e.textContent ?? "").trim().slice(0, 40),
              value: e.getAttribute("aria-current"),
            })),
          };
        }, selector));
        entry.shot = await shot(`click${idx + 1}`);
        entry.ok = true;
      } catch (err) {
        entry.error = String(err.message).split("\n")[0];
      }
      res.clicks.push(entry);
    }

    for (const spec of opts.expect) res.expects.push(await checkExpect(page, spec));
  } catch (err) {
    res.error = String(err.message).split("\n")[0];
  } finally {
    await context.close();
  }
  return res;
}

// 같은 (url, viewport, motion) 에서 chromium 과 webkit 의 차이
function compare(results) {
  const diffs = [];
  const groups = new Map();
  for (const r of results) {
    const key = `${r.url}|${r.viewport}|${r.motion}`;
    if (!groups.has(key)) groups.set(key, {});
    groups.get(key)[r.browser] = r;
  }
  for (const [key, g] of groups) {
    if (!g.chromium || !g.webkit) continue;
    const [url, viewport, motion] = key.split("|");
    const where = { url, viewport, motion };
    const add = (item, chromiumVal, webkitVal) => {
      if (JSON.stringify(chromiumVal) !== JSON.stringify(webkitVal)) {
        diffs.push({ ...where, item, chromium: chromiumVal, webkit: webkitVal });
      }
    };
    add("status", g.chromium.status, g.webkit.status);
    add("scrollHeight", g.chromium.metrics?.scrollHeight, g.webkit.metrics?.scrollHeight);
    add("overflowX", g.chromium.metrics?.overflowX, g.webkit.metrics?.overflowX);
    add("console 수", g.chromium.console.length, g.webkit.console.length);
    add("실패 요청 수", g.chromium.failedRequests.length, g.webkit.failedRequests.length);
    add("스크롤 실제 위치", g.chromium.scrolls.map((s) => s.actual), g.webkit.scrolls.map((s) => s.actual));
    add("클릭 후 scrollY", g.chromium.clicks.map((c) => c.scrollY), g.webkit.clicks.map((c) => c.scrollY));
    add("클릭 후 aria-current", g.chromium.clicks.map((c) => c.allAriaCurrent), g.webkit.clicks.map((c) => c.allAriaCurrent));
    add("기대 상태", g.chromium.expects.map((e) => e.ok), g.webkit.expects.map((e) => e.ok));
  }
  return diffs;
}

const opts = parseArgs(process.argv.slice(2));
mkdirSync(OUT_DIR, { recursive: true });

const results = [];
for (const engineName of opts.browser) {
  const browser = await ENGINES[engineName].launch();
  try {
    for (const url of opts.url) {
      for (const vpName of opts.viewport) {
        for (const motion of opts.motion) {
          results.push(await runCase(browser, engineName, vpName, url, motion, opts));
        }
      }
    }
  } finally {
    await browser.close();
  }
}

const diffs = opts.browser.length > 1 ? compare(results) : [];
const reportPath = join(OUT_DIR, "report.json");
writeFileSync(reportPath, JSON.stringify({ opts, results, diffs }, null, 2));

console.log("| 브라우저 | 뷰포트 | motion | URL | 상태 | console | 실패 요청 | 스크린샷 | 가로 넘침 |");
console.log("|---|---|---|---|---|---|---|---|---|");
for (const r of results) {
  console.log(
    `| ${r.browser} | ${r.viewport} | ${r.motion} | ${r.url} | ${r.error ? `오류: ${r.error}` : r.status} | ${r.console.length} | ${r.failedRequests.length} | ${r.shots.length} | ${r.metrics?.overflowX ?? "?"} |`,
  );
}
for (const r of results) {
  const tag = `[${r.browser} ${r.viewport} ${r.motion}]`;
  for (const c of r.console) console.log(`${tag} console.${c.type}: ${c.text}`);
  for (const f of r.failedRequests) console.log(`${tag} 실패 요청: ${f.url} (${f.reason})`);
  for (const c of r.clicks) {
    console.log(`${tag} click ${c.selector}: ${c.ok ? `scrollY=${c.scrollY} hash=${c.hash} aria-current=${c.clickedAriaCurrent}` : `실패 ${c.error}`}`);
  }
  for (const e of r.expects) console.log(`${tag} expect ${e.spec}: ${e.ok ? "일치" : `불일치 (실제: ${e.actual})`}`);
}
for (const d of diffs) {
  console.log(`[차이] ${d.url} ${d.viewport} ${d.motion} ${d.item}: chromium=${JSON.stringify(d.chromium)} webkit=${JSON.stringify(d.webkit)}`);
}
console.log(`\n리포트: ${reportPath}`);
console.log(`스크린샷 폴더: ${OUT_DIR}`);
