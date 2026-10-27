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
    const bodyText = document.body.textContent.replace(/\\s+/g, " ");
    const budgetMatches = [...new Set(
      bodyText.match(/预算|人均|总价|房费|房价|每晚|计费|5000|room budget|per person/gi) || []
    )];
    const routeTravel = routeCards.map((card) =>
      card.querySelector(".route-kicker span:last-child")?.textContent.trim() || ""
    );
    const travelMinutes = routeTravel.flatMap((text) =>
      [...text.matchAll(/(\\d+)\\s*分钟/g)].map((match) => Number(match[1]))
    );
    const mapStops = [...document.querySelectorAll("#map .map-stop")]
      .map((stop) => stop.getAttribute("aria-label") || "");
    const activeRegionLabels = [...document.querySelectorAll(".region-nav a")]
      .map((link) => link.textContent.replace(/\\s+/g, " ").trim());
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
      stayReferenceNameFont: textFont(".stay-reference-copy > strong"),
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
      routeStayReferences: document.querySelectorAll(".route-card .stay-reference").length,
      rankStayReferences: document.querySelectorAll(".rank-row .stay-reference").length,
      routeStayReferenceItems: document.querySelectorAll(".route-card .stay-reference-item").length,
      rankStayReferenceItems: document.querySelectorAll(".rank-row .stay-reference-item").length,
      rankStayReferenceWidth: Math.round(
        document.querySelector(".rank-row .stay-reference")?.getBoundingClientRect().width || 0
      ),
      dialogStayCards: document.querySelectorAll(".dialog-stay-card").length,
      dialogStaySections: document.querySelectorAll(".dialog-stay-section").length,
      stayAmenityTags: document.querySelectorAll(".stay-card .stay-amenities span").length,
      dialogAmenityTags: document.querySelectorAll(".dialog-stay-card .stay-amenities span").length,
      rankScores: rankRows.map((row) => Number(row.querySelector(".row-score b").textContent)),
      rankTitles: rankRows.map((row) => row.querySelector(".row-main > strong").textContent.trim()),
      routeTitles: routeCards.map((card) => card.querySelector(".route-title").textContent.trim()),
      routeTravel,
      travelMinutes,
      staySectionPresent: Boolean(staySection),
      staySectionVisible: staySection ? getComputedStyle(staySection).display !== "none" : false,
      stayCardVisible: stayCards[0] ? stayCards[0].getBoundingClientRect().height > 0 : false,
      staySectionInDetails: Boolean(document.querySelector(".stay-section details")),
      legacyMapVisible: Boolean(document.querySelector(".desktop-region-map, .mobile-region-map")),
      mapStops,
      mapLinks: document.querySelectorAll("#map .map-link").length,
      mapIndexRoutes: document.querySelectorAll("#map .map-route-index a").length,
      mapText: document.querySelector("#map")?.textContent.replace(/\\s+/g, " ").trim() || "",
      activeRegionLabels,
      introText: document.querySelector(".intro")?.textContent.replace(/\\s+/g, " ").trim() || "",
      dialogueStayText: document.querySelector(".route-dialog .dialog-stay-section")?.textContent.replace(/\\s+/g, " ").trim() || "",
      dialogSupported: typeof HTMLDialogElement !== "undefined",
      budgetMatches,
      images: document.images.length,
      brokenImages
    };
  })()`);

  assert(initial.rankRows === 3, `${prefix}: expected 3 ranking rows, got ${initial.rankRows}`);
  assert(initial.routeCards === 3, `${prefix}: expected 3 route cards, got ${initial.routeCards}`);
  assert(initial.routeDialogs === 3, `${prefix}: expected 3 dialogs, got ${initial.routeDialogs}`);
  assert(initial.stayCards === 4, `${prefix}: expected 4 stay cards, got ${initial.stayCards}`);
  assert(initial.routeReviewCards === 3, `${prefix}: every route card needs a one-line review`);
  assert(initial.routeFeeCards === 3, `${prefix}: every route card needs a fee warning`);
  assert(initial.routePlaceReviews === 3, `${prefix}: every route card needs a source place review`);
  assert(initial.rankPlaceReviews === 3, `${prefix}: every ranking row needs a source place review`);
  assert(initial.dialogPlaceReviews === 3, `${prefix}: every dialog needs a source place review`);
  assert(initial.dialogReviewBlocks === 3, `${prefix}: every dialog needs a one-line review`);
  assert(initial.routeStayReferences === 3, `${prefix}: every route card needs a stay reference`);
  assert(initial.rankStayReferences === 3, `${prefix}: every ranking row needs a stay reference`);
  assert(initial.routeStayReferenceItems === 6, `${prefix}: route cards should show two stay candidates each`);
  assert(initial.rankStayReferenceItems === 3, `${prefix}: ranking rows should show one primary stay each`);
  assert(initial.rankStayReferenceWidth >= 300, `${prefix}: ranking stay reference is too narrow`);
  assert(initial.dialogStayCards === 6, `${prefix}: each dialog should show both nearby stay candidates`);
  assert(initial.dialogStaySections === 3, `${prefix}: each dialog needs a stay section`);
  assert(initial.stayAmenityTags >= 12, `${prefix}: stay cards are missing amenity tags`);
  assert(initial.dialogAmenityTags >= 18, `${prefix}: dialog stay cards are missing amenity tags`);
  assert(initial.dialogueStayText.includes("订前先问"), `${prefix}: stay cards need booking checks`);
  assert(initial.dialogueStayText.includes("4间房适配"), `${prefix}: stay cards need 4-room fit notes`);
  assert(initial.staySectionVisible && initial.stayCardVisible, `${prefix}: stays must remain visible`);
  assert(!initial.staySectionInDetails, `${prefix}: accommodation must not be folded into details`);
  assert(initial.dialogSupported, `${prefix}: native dialog support is required`);
  assert(!initial.legacyMapVisible, `${prefix}: legacy map markup must not render`);
  assert(initial.mapStops.length === 4, `${prefix}: expected 4 map stops, got ${initial.mapStops.length}`);
  assert(initial.mapLinks === 4, `${prefix}: expected 4 direction links, got ${initial.mapLinks}`);
  assert(initial.mapIndexRoutes === 3, `${prefix}: expected 3 active routes in the map index`);
  assert(initial.mapText.includes("按高德经纬度等比定位"), `${prefix}: map must state its coordinate basis`);
  assert(initial.mapText.includes("高德驾车"), `${prefix}: map index must show Amap drive times`);
  assert(!initial.mapText.includes("只示意相对位置"), `${prefix}: stale map caveat remains`);
  assert(initial.activeRegionLabels.join(",") === "总榜,奉贤,浦东,位置图,住宿候选", `${prefix}: inactive regions remain in navigation: ${initial.activeRegionLabels.join(",")}`);
  assert(!initial.introText.includes("苏州"), `${prefix}: intro still mentions removed cross-city routes`);
  assert(!initial.introText.includes("住宿放在最后"), `${prefix}: intro still de-emphasizes stays`);
  assert(initial.travelMinutes.length >= 4, `${prefix}: drive-time labels are missing`);
  assert(initial.travelMinutes.every((minutes) => minutes <= 90), `${prefix}: a route exceeds 90 minutes: ${initial.travelMinutes.join(",")}`);
  assert(!initial.horizontalOverflow, `${prefix}: horizontal page overflow detected`);
  assert(
    initial.overflowElements.length === 0,
    `${prefix}: child elements exceed the viewport: ${JSON.stringify(initial.overflowElements)}`
  );
  assert(initial.brokenImages.length === 0, `${prefix}: broken images: ${initial.brokenImages.join(", ")}`);
  assert(initial.budgetMatches.length === 0, `${prefix}: budget terms remain: ${initial.budgetMatches.join(", ")}`);
  assert(initial.bodyFont >= 20, `${prefix}: body text is too small`);
  assert(initial.routeTitleFont >= 28, `${prefix}: route titles are too small`);
  assert(initial.rankTitleFont >= 20, `${prefix}: ranking titles are too small`);
  assert(initial.reviewFont >= 18, `${prefix}: review text is too small`);
  assert(initial.stayReferenceNameFont >= 16, `${prefix}: stay reference names are too small`);
  assert(initial.stayTitleFont >= 32, `${prefix}: stay section heading is too small`);
  assert(
    initial.rankScores.join(",") === "85,77,75",
    `${prefix}: unexpected ranking order: ${initial.rankScores.join(",")}`
  );
  assert(
    initial.rankTitles.join(" | ") === "新场古镇 · 逛吃＋茶馆 | 花开半夏 · 成人手作＋乡村体验 | 川沙 · 老街人文＋比斯特",
    `${prefix}: unexpected ranking titles: ${initial.rankTitles.join(" | ")}`
  );
  assert(
    initial.routeTitles.join(" | ") === "花开半夏 · 成人手作＋乡村体验 | 新场古镇 · 逛吃＋茶馆 | 川沙 · 老街人文＋比斯特",
    `${prefix}: active route cards are wrong: ${initial.routeTitles.join(" | ")}`
  );
  assert(
    initial.mapStops.join(" | ").includes("花开半夏") &&
      initial.mapStops.join(" | ").includes("新场古镇") &&
      initial.mapStops.join(" | ").includes("川沙古镇") &&
      initial.mapStops.join(" | ").includes("比斯特上海"),
    `${prefix}: map stops do not match the active routes`
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
      hasFee: Boolean(dialog.querySelector(".fee-line")),
      stayCards: dialog.querySelectorAll(".dialog-stay-card").length,
      amenityText: dialog.querySelector(".dialog-stay-section").textContent.replace(/\\s+/g, " "),
      hasStaySource: [...dialog.querySelectorAll(".dialog-stay-card a")].every((link) => /^https?:/.test(link.href))
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
  assert(openedFromRank.stayCards === 2, `${prefix}: dialog should show two stay cards`);
  assert(openedFromRank.hasStaySource, `${prefix}: dialog stay cards need source links`);
  assert(
    /独栋|麻将\/棋牌|KTV|烧烤/.test(openedFromRank.amenityText),
    `${prefix}: dialog stay cards need multiplayer amenity tags`
  );
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
    const frame = section.querySelector(".map-frame");
    scrollTo(0, Math.max(0, section.offsetTop - 132));
    frame.scrollLeft = Math.max(0, (frame.scrollWidth - frame.clientWidth) / 2);
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
  await evaluate(send, `(() => {
    const body = document.querySelector("dialog.route-dialog[open] .route-dialog-body");
    const section = body?.querySelector(".dialog-stay-section");
    if (!body || !section) return;
    const bodyTop = body.getBoundingClientRect().top;
    const sectionTop = section.getBoundingClientRect().top;
    body.scrollTop += sectionTop - bodyTop - 12;
  })()`);
  await sleep(180);
  await capture(send, `${prefix}-route-dialog-stays.png`);
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
