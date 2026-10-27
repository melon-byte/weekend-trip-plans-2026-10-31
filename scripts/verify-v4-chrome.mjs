import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const requestedHtml = process.argv[2] || "weekend-trip-plans-2026-10-31-v4.html";
const htmlPath = path.isAbsolute(requestedHtml) ? requestedHtml : path.join(root, requestedHtml);
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const debugPort = 9200 + Math.floor(Math.random() * 300);
const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chrome-v4-"));

const chrome = spawn(chromePath, [
  "--headless=new",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profileDir}`,
  "--no-first-run",
  "--disable-default-apps",
  "--disable-extensions",
  "--disable-sync",
  "--disable-background-networking",
  "--hide-scrollbars",
  "--allow-file-access-from-files",
  "about:blank"
], { stdio: "ignore" });

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForDebugEndpoint() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      if (response.ok) return response.json();
    } catch {
      // Chrome needs a moment to start listening.
    }
    await sleep(100);
  }
  throw new Error("Chrome DevTools endpoint did not start");
}

async function connect(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  socket.binaryType = "arraybuffer";
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let commandId = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const raw = typeof event.data === "string"
      ? event.data
      : Buffer.from(event.data).toString("utf8");
    const message = JSON.parse(raw);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  return {
    socket,
    send(method, params = {}) {
      commandId += 1;
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          pending.delete(commandId);
          reject(new Error(`Chrome command timed out: ${method}`));
        }, 30000);
        pending.set(commandId, {
          resolve(value) {
            clearTimeout(timeout);
            resolve(value);
          },
          reject(error) {
            clearTimeout(timeout);
            reject(error);
          }
        });
        socket.send(JSON.stringify({ id: commandId, method, params }));
      });
    }
  };
}

async function evaluate(send, expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function waitForReady(send) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const state = await evaluate(send, "document.readyState");
    if (state === "complete") {
      await sleep(500);
      return;
    }
    await sleep(100);
  }
  throw new Error("Page did not finish loading");
}

async function loadLazyImages(send) {
  console.error("Loading lazy images...");
  await evaluate(send, `(async () => {
    const images = [...document.images];
    images.forEach((image) => { image.loading = "eager"; });
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
    scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 100));
  })()`);
}

async function capture(send, outputName) {
  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false
  });
  fs.writeFileSync(path.join(root, outputName), Buffer.from(screenshot.data, "base64"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function inspectAt(send, width, height, mobile, prefix) {
  console.error(`Inspecting ${prefix}...`);
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: mobile ? 2 : 1,
    mobile,
    screenWidth: width,
    screenHeight: height
  });
  await send("Page.navigate", { url: pathToFileURL(htmlPath).href });
  await waitForReady(send);
  await evaluate(send, "document.documentElement.style.scrollBehavior = 'auto'");
  await loadLazyImages(send);
  console.error(`Reading ${prefix} layout...`);

  const initial = await evaluate(send, `(() => {
    const textFont = (selector) => {
      const element = document.querySelector(selector);
      return element ? parseFloat(getComputedStyle(element).fontSize) : null;
    };
    const routeCards = [...document.querySelectorAll(".route-card")];
    const rankRows = [...document.querySelectorAll(".rank-row")];
    const routeDialogs = [...document.querySelectorAll("dialog.route-dialog")];
    const stayCards = [...document.querySelectorAll(".stay-card")];
    const staySection = document.querySelector("#stays");
    const docWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const overflowElements = [...document.querySelectorAll("main *")]
      .filter((element) => !element.closest(".region-nav"))
      .filter((element) => !element.closest("dialog:not([open])"))
      .filter((element) => !element.closest("svg"))
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 1 && (rect.left < -1 || rect.right > innerWidth + 1);
      })
      .slice(0, 12)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        className: element.className || "",
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right)
      }));
    const brokenImages = [...document.images]
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.getAttribute("src"));
    const searchableText = [
      ...routeCards,
      ...rankRows,
      ...routeDialogs,
      ...stayCards,
      document.querySelector(".page-note")
    ].map((element) => element?.textContent || "").join(" ");
    const budgetMatches = [...new Set(
      searchableText.match(/预算|人均|总价|房费|房价|每晚|5000|room budget|per person/gi) || []
    )];
    const newRoutePlaceReviews = ["s01", "s02", "s03"].map((routeId) => {
      const meta = document.querySelector("#route-" + routeId + " .place-review-meta--card");
      return meta ? meta.textContent.replace(/\s+/g, " ").trim() : "";
    });
    return {
      viewport: [innerWidth, innerHeight],
      documentWidth: docWidth,
      horizontalOverflow: docWidth > innerWidth + 1,
      overflowElements,
      bodyFont: textFont("body"),
      routeTitleFont: textFont(".route-title"),
      rankTitleFont: textFont(".row-main > strong"),
      reviewFont: textFont(".route-card .review-line"),
      stayTitleFont: textFont(".stay-section-heading h2"),
      rankRows: rankRows.length,
      routeCards: routeCards.length,
      routeDialogs: routeDialogs.length,
      stayCards: stayCards.length,
      routeReviewCards: document.querySelectorAll(".route-card .review-line").length,
      routeFeeCards: document.querySelectorAll(".route-card .fee-line").length,
      routePlaceReviews: document.querySelectorAll(".route-card .place-review-meta--card").length,
      rankPlaceReviews: document.querySelectorAll(".rank-row .place-review-meta--row").length,
      dialogPlaceReviews: document.querySelectorAll(".route-dialog .place-review-meta--dialog").length,
      dialogReviewBlocks: document.querySelectorAll(".route-dialog .dialog-review").length,
      rankScores: rankRows.map((row) => Number(row.querySelector(".row-score b").textContent)),
      staySectionPresent: Boolean(staySection),
      staySectionVisible: staySection ? getComputedStyle(staySection).display !== "none" : false,
      stayCardVisible: stayCards[0] ? stayCards[0].getBoundingClientRect().height > 0 : false,
      staySectionInDetails: Boolean(document.querySelector(".stay-section details")),
      mobileMapVisible: Boolean(document.querySelector(".mobile-region-map") &&
        getComputedStyle(document.querySelector(".mobile-region-map")).display !== "none"),
      desktopMapVisible: Boolean(document.querySelector(".desktop-region-map") &&
        getComputedStyle(document.querySelector(".desktop-region-map")).display !== "none"),
      dialogSupported: typeof HTMLDialogElement !== "undefined",
      newRoutePlaceReviews,
      budgetMatches,
      images: document.images.length,
      brokenImages
    };
  })()`);

  assert(initial.rankRows === 18, `${prefix}: expected 18 ranking rows, got ${initial.rankRows}`);
  assert(initial.routeCards === 18, `${prefix}: expected 18 route cards, got ${initial.routeCards}`);
  assert(initial.routeDialogs === 18, `${prefix}: expected 18 dialogs, got ${initial.routeDialogs}`);
  assert(initial.stayCards === 14, `${prefix}: expected 14 stay cards, got ${initial.stayCards}`);
  assert(initial.routeReviewCards === 18, `${prefix}: every route card needs a one-line review`);
  assert(initial.routeFeeCards === 18, `${prefix}: every route card needs a fee warning`);
  assert(initial.routePlaceReviews === 18, `${prefix}: every route card needs a source place review`);
  assert(initial.rankPlaceReviews === 18, `${prefix}: every ranking row needs a source place review`);
  assert(initial.dialogPlaceReviews === 18, `${prefix}: every dialog needs a source place review`);
  const jinxiReview = initial.newRoutePlaceReviews[0];
  assert(
    jinxiReview.includes("美团3.9") &&
      jinxiReview.includes("高德4.7") &&
      jinxiReview.includes("评价条数未返回"),
    `${prefix}: Jinxi needs Meituan/Amap scores and a missing-count note; got ${JSON.stringify(initial.newRoutePlaceReviews[0])}`
  );
  const zhouzhuangReview = initial.newRoutePlaceReviews[1];
  assert(
    zhouzhuangReview.includes("美团4.4") &&
      zhouzhuangReview.includes("高德4.7") &&
      zhouzhuangReview.includes("评价条数未返回"),
    `${prefix}: Zhouzhuang needs Meituan/Amap scores and a missing-count note; got ${JSON.stringify(initial.newRoutePlaceReviews[1])}`
  );
  const miaomiaoReview = initial.newRoutePlaceReviews[2];
  assert(
    miaomiaoReview.includes("美团4.1") &&
      miaomiaoReview.includes("292条") &&
      miaomiaoReview.includes("高德4.2"),
    `${prefix}: Miaomiao Peak needs the Meituan score/count and Amap score; got ${JSON.stringify(initial.newRoutePlaceReviews[2])}`
  );
  assert(initial.dialogReviewBlocks === 18, `${prefix}: every dialog needs a one-line review`);
  assert(initial.staySectionVisible && initial.stayCardVisible, `${prefix}: stays must remain visible`);
  assert(!initial.staySectionInDetails, `${prefix}: accommodation must not be folded into details`);
  assert(initial.dialogSupported, `${prefix}: native dialog support is required`);
  assert(!initial.horizontalOverflow, `${prefix}: horizontal page overflow detected`);
  assert(
    initial.overflowElements.length === 0,
    `${prefix}: child elements exceed the viewport: ${JSON.stringify(initial.overflowElements)}`
  );
  assert(initial.brokenImages.length === 0, `${prefix}: broken images: ${initial.brokenImages.join(", ")}`);
  assert(initial.budgetMatches.length === 0, `${prefix}: budget terms remain: ${initial.budgetMatches.join(", ")}`);
  assert(initial.mobileMapVisible === mobile, `${prefix}: wrong map variant is visible`);
  assert(initial.desktopMapVisible === !mobile, `${prefix}: wrong map variant is visible`);
  assert(initial.bodyFont >= 20, `${prefix}: body text is too small`);
  assert(initial.routeTitleFont >= 28, `${prefix}: route titles are too small`);
  assert(initial.rankTitleFont >= 20, `${prefix}: ranking titles are too small`);
  assert(initial.reviewFont >= 18, `${prefix}: review text is too small`);
  assert(
    initial.rankScores.join(",") === "85,83,82,81,81,80,80,79,78,77,77,76,76,75,75,71,69,68",
    `${prefix}: unexpected ranking order: ${initial.rankScores.join(",")}`
  );

  const openedFromRank = await evaluate(send, `(async () => {
    const row = document.querySelector(".rank-row");
    row.click();
    await new Promise((resolve) => setTimeout(resolve, 150));
    const dialog = document.getElementById(row.getAttribute("aria-controls"));
    const state = {
      open: dialog.open,
      title: dialog.querySelector("h2").textContent.trim(),
      hasScoreParts: dialog.querySelectorAll(".score-parts > span").length === 4,
      hasPlaceReview: Boolean(dialog.querySelector(".place-review-meta--dialog")),
      hasReview: Boolean(dialog.querySelector(".dialog-review")),
      hasFee: Boolean(dialog.querySelector(".fee-line"))
    };
    dialog.querySelector("[data-close-dialog]").click();
    state.closedByButton = !dialog.open;
    return state;
  })()`);
  assert(openedFromRank.open, `${prefix}: ranking row did not open its dialog`);
  assert(openedFromRank.hasScoreParts, `${prefix}: dialog score breakdown is incomplete`);
  assert(openedFromRank.hasPlaceReview, `${prefix}: dialog is missing the source place review`);
  assert(openedFromRank.hasReview, `${prefix}: dialog is missing its one-line review`);
  assert(openedFromRank.hasFee, `${prefix}: dialog is missing its fee warning`);
  assert(openedFromRank.closedByButton, `${prefix}: close button did not close the dialog`);

  const openedFromCard = await evaluate(send, `(async () => {
    const cardButton = document.querySelector(".route-launcher");
    cardButton.click();
    await new Promise((resolve) => setTimeout(resolve, 100));
    const dialog = document.getElementById(cardButton.getAttribute("aria-controls"));
    return {
      open: dialog.open,
      activeInside: dialog.contains(document.activeElement),
      bodyLocked: document.body.classList.contains("dialog-open")
    };
  })()`);
  assert(openedFromCard.open, `${prefix}: route card did not open its dialog`);
  assert(openedFromCard.activeInside, `${prefix}: dialog did not receive focus`);
  assert(openedFromCard.bodyLocked, `${prefix}: page scroll lock was not applied`);

  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await sleep(120);
  const closedByEscape = await evaluate(send, `(() => {
    const openDialog = document.querySelector("dialog.route-dialog[open]");
    return {
      closed: !openDialog,
      bodyUnlocked: !document.body.classList.contains("dialog-open")
    };
  })()`);
  assert(closedByEscape.closed, `${prefix}: Escape did not close the dialog`);
  assert(closedByEscape.bodyUnlocked, `${prefix}: page scroll lock was not released`);

  await evaluate(send, "scrollTo(0, 0)");
  console.error(`Capturing ${prefix} screenshots...`);
  await sleep(150);
  await capture(send, `${prefix}-top.png`);

  await evaluate(send, `(() => {
    const section = document.querySelector("#map");
    scrollTo(0, Math.max(0, section.offsetTop - 132));
  })()`);
  await sleep(200);
  await capture(send, `${prefix}-map.png`);

  await evaluate(send, `(() => {
    const section = document.querySelector("#ranking");
    scrollTo(0, Math.max(0, section.offsetTop - 132));
  })()`);
  await sleep(200);
  await capture(send, `${prefix}-ranking.png`);

  await evaluate(send, `(() => {
    const button = document.querySelector(".rank-row");
    button.click();
  })()`);
  await sleep(180);
  await capture(send, `${prefix}-route-dialog.png`);
  await evaluate(send, `document.querySelector("dialog.route-dialog[open]")?.close()`);

  await evaluate(send, `(() => {
    const section = document.querySelector("#stays");
    scrollTo(0, Math.max(0, section.offsetTop - 132));
  })()`);
  await sleep(200);
  await capture(send, `${prefix}-stays.png`);

  return {
    ...initial,
    dialogRankTitle: openedFromRank.title,
    dialogOpenedFromRank: openedFromRank.open,
    dialogOpenedFromCard: openedFromCard.open,
    dialogActiveInside: openedFromCard.activeInside,
    dialogClosedByButton: openedFromRank.closedByButton,
    dialogClosedByEscape: closedByEscape.closed
  };
}

try {
  const targets = await waitForDebugEndpoint();
  const page = targets.find((target) => target.type === "page");
  if (!page) throw new Error("No Chrome page target found");
  const { socket, send } = await connect(page.webSocketDebuggerUrl);

  await send("Page.enable");
  await send("Runtime.enable");
  const mobile = await inspectAt(send, 390, 844, true, "mobile-390");
  const desktop = await inspectAt(send, 1440, 1000, false, "desktop-1440");

  console.log(JSON.stringify({ mobile, desktop }, null, 2));
  socket.close();
} finally {
  chrome.kill();
}
