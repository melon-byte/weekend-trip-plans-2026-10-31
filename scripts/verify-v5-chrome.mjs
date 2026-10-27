import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const requestedHtml = process.argv[2] || "weekend-trip-plans-2026-10-31-v5.html";
const htmlPath = path.isAbsolute(requestedHtml) ? requestedHtml : path.join(root, requestedHtml);
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const debugPort = 9200 + Math.floor(Math.random() * 300);
const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chrome-v5-"));

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

const htmlSource = fs.readFileSync(htmlPath, "utf8");
const referencedImagePaths = [...new Set(
  [...htmlSource.matchAll(/src="(assets\/[^"]+)"/g)].map((match) => decodeURIComponent(match[1]))
)];
const imageFileStats = referencedImagePaths.map((assetPath) => {
  const stats = fs.statSync(path.join(root, assetPath));
  return { assetPath, bytes: stats.size };
});
const totalImageBytes = imageFileStats.reduce((sum, file) => sum + file.bytes, 0);
const largestImage = imageFileStats.reduce((largest, file) => file.bytes > largest.bytes ? file : largest);

assert(totalImageBytes <= 4 * 1024 * 1024, `referenced images are too heavy: ${Math.round(totalImageBytes / 1024)} KB`);
assert(
  largestImage.bytes <= 320 * 1024,
  `largest image is too heavy: ${largestImage.assetPath} (${Math.round(largestImage.bytes / 1024)} KB)`
);

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
    const rankBoard = document.querySelector(".rank-board");
    const rankingSection = document.querySelector(".ranking-section");
    const routeDialogs = [...document.querySelectorAll("dialog.route-dialog")];
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const tabPanels = [...document.querySelectorAll('[role="tabpanel"]')];
    const mapImage = document.querySelector("#map .region-map-photo");
    const mapFrame = document.querySelector("#map .map-frame");
    const mapFrameRect = mapFrame?.getBoundingClientRect();
    const stayCards = [...document.querySelectorAll(".stay-card")];
    const staySection = document.querySelector("#stays");
    const firstRankRow = rankRows[0];
    const placePhoto = firstRankRow?.querySelector(".row-photo");
    const stayPhoto = firstRankRow?.querySelector(".stay-reference-item img");
    const placePhotoRect = placePhoto?.getBoundingClientRect();
    const stayPhotoRect = stayPhoto?.getBoundingClientRect();
    const firstRankRowRect = firstRankRow?.getBoundingClientRect();
    const rankingSectionRect = rankingSection?.getBoundingClientRect();
    const rankingSectionStyle = rankingSection ? getComputedStyle(rankingSection) : null;
    const rankBoardStyle = rankBoard ? getComputedStyle(rankBoard) : null;
    const docWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const overflowElements = [...document.querySelectorAll("main *")]
      .filter((element) => !element.closest(".region-nav"))
      .filter((element) => !element.closest(".map-frame"))
      .filter((element) => !element.closest("dialog:not([open])"))
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
    const feeWarningText = [...document.querySelectorAll(".route-card .fee-line")]
      .map((element) => element.textContent.replace(/\\s+/g, " ").trim())
      .join(" ");
    const feeReminderTerms = ["票价", "另收费", "收费先问"]
      .filter((term) => feeWarningText.includes(term));
    const rankScenicImageSrcs = [...document.querySelectorAll(".rank-row .row-photo")]
      .map((image) => image.getAttribute("src") || "");
    const rankRowHeights = rankRows.map((row) =>
      Math.round(row.getBoundingClientRect().height)
    );
    const rankTagCounts = rankRows.map((row) =>
      row.querySelectorAll(".row-tags span").length
    );
    const rankRowParts = Object.fromEntries(
      [".row-head", ".row-review", ".place-review-meta--row", ".stay-reference--row", ".row-tags"]
        .map((selector) => [
          selector,
          Math.round(firstRankRow?.querySelector(selector)?.getBoundingClientRect().height || 0)
        ])
    );
    const budgetMatches = [...new Set(
      bodyText.match(/预算|人均|总价|房费|房价|每晚|计费|5000|room budget|per person/gi) || []
    )];
    const routeTravel = routeCards.map((card) =>
      card.querySelector(".route-kicker span:last-child")?.textContent.trim() || ""
    );
    const regionRouteScores = Object.fromEntries(
      [...document.querySelectorAll("#panel-regions .region-section")]
        .map((section) => [
          section.id,
          [...section.querySelectorAll(".route-card")].map((card) =>
            Number(card.querySelector(".card-score")?.childNodes[0]?.textContent || 0)
          )
        ])
    );
    const travelMinutes = routeTravel.flatMap((text) =>
      [...text.matchAll(/(\\d+)\\s*分钟/g)].map((match) => Number(match[1]))
    );
    const activeRegionLabels = [...document.querySelectorAll(".region-nav a")]
      .map((link) => link.textContent.replace(/\\s+/g, " ").trim());
    return {
      viewport: [innerWidth, innerHeight],
      pageTitle: document.querySelector("h1")?.textContent.trim() || "",
      tabLabels: tabs.map((tab) => tab.textContent.replace(/\\s+/g, " ").trim()),
      selectedTab: tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.textContent.trim() || "",
      initialVisiblePanels: tabPanels.filter((panel) => !panel.hidden).map((panel) => panel.id),
      initialHiddenPanels: tabPanels.filter((panel) => panel.hidden).map((panel) => panel.id),
      regionNavCount: document.querySelectorAll(".region-nav").length,
      regionNavInsideRegions:
        document.querySelectorAll("#panel-regions .region-nav").length === 1 &&
        document.querySelectorAll("#panel-ranking .region-nav, #panel-map .region-nav, .topbar .region-nav").length === 0,
      regionNavLabels: [...document.querySelectorAll("#panel-regions .region-nav a")]
        .map((link) => link.textContent.replace(/\\s+/g, " ").trim()),
      placePhotoLeft: placePhotoRect ? Math.round(placePhotoRect.left) : null,
      stayPhotoLeft: stayPhotoRect ? Math.round(stayPhotoRect.left) : null,
      placePhotoWidth: placePhotoRect ? Math.round(placePhotoRect.width) : null,
      placePhotoHeight: placePhotoRect ? Math.round(placePhotoRect.height) : null,
      stayPhotoWidth: stayPhotoRect ? Math.round(stayPhotoRect.width) : null,
      stayPhotoHeight: stayPhotoRect ? Math.round(stayPhotoRect.height) : null,
      documentWidth: docWidth,
      horizontalOverflow: docWidth > innerWidth + 1,
      overflowElements,
      bodyFont: textFont("body"),
      topbars: document.querySelectorAll("header.topbar").length,
      tripFacts: document.querySelectorAll(".trip-facts").length,
      routeTitleFont: textFont(".route-title"),
      rankTitleFont: textFont(".row-main > strong"),
      rankReviewFont: textFont(".row-review"),
      reviewFont: textFont(".route-card .review-line"),
      stayReferenceNameFont: textFont(".stay-reference-copy > strong"),
      rankRows: rankRows.length,
      rankRowHeights,
      rankBoardPaddingLeft: rankBoardStyle ? parseFloat(rankBoardStyle.paddingLeft) : null,
      rankingContentLeft: rankingSectionRect && rankingSectionStyle
        ? Math.round(rankingSectionRect.left + parseFloat(rankingSectionStyle.paddingLeft))
        : null,
      firstRankRowLeft: firstRankRowRect ? Math.round(firstRankRowRect.left) : null,
      rankRowParts,
      rankTagCounts,
      routeCards: routeCards.length,
      routeDialogs: routeDialogs.length,
      stayCards: stayCards.length,
      routeIds: routeCards.map((card) => card.id.replace(/^route-/, "")).sort(),
      routeReviewCards: document.querySelectorAll(".route-card .review-line").length,
      routeFeeCards: document.querySelectorAll(".route-card .fee-line").length,
      routePlaceReviews: document.querySelectorAll(".route-card .place-review-meta--card").length,
      rankPlaceReviews: document.querySelectorAll(".rank-row .place-review-meta--row").length,
      dialogPlaceReviews: document.querySelectorAll(".route-dialog .place-review-meta--dialog").length,
      dialogReviewBlocks: document.querySelectorAll(".route-dialog .dialog-review").length,
      feeWarningText,
      feeReminderTerms,
      rankScenicImageSrcs,
      routeStayReferences: document.querySelectorAll(".route-card .stay-reference").length,
      rankStayReferences: document.querySelectorAll(".rank-row .stay-reference").length,
      routeStayReferenceItems: document.querySelectorAll(".route-card .stay-reference-item").length,
      rankStayReferenceItems: document.querySelectorAll(".rank-row .stay-reference-item").length,
      dialogStayCards: document.querySelectorAll(".dialog-stay-card").length,
      dialogStaySections: document.querySelectorAll(".dialog-stay-section").length,
      routeAmenityTags: document.querySelectorAll(".route-card .stay-amenities span").length,
      dialogAmenityTags: document.querySelectorAll(".dialog-stay-card .stay-amenities span").length,
      rankScores: rankRows.map((row) => Number(row.querySelector(".row-score b").textContent)),
      rankTitles: rankRows.map((row) => row.querySelector(".row-main > strong").textContent.trim()),
      routeTitles: routeCards.map((card) => card.querySelector(".route-title").textContent.trim()),
      regionRouteScores,
      routeTravel,
      travelMinutes,
      staySectionPresent: Boolean(staySection),
      staySectionInDetails: Boolean(document.querySelector(".stay-section details")),
      legacyMapVisible: Boolean(document.querySelector(".desktop-region-map, .mobile-region-map")),
      mapImagePresent: Boolean(mapImage),
      mapImageLoaded: Boolean(mapImage?.complete && mapImage?.naturalWidth > 0),
      mapImageSrc: mapImage?.getAttribute("src") || "",
      mapImageAlt: mapImage?.getAttribute("alt") || "",
      mapImageNaturalWidth: mapImage?.naturalWidth || 0,
      mapImageNaturalHeight: mapImage?.naturalHeight || 0,
      mapFrameHeight: mapFrameRect ? Math.round(mapFrameRect.height) : 0,
      mapIndexRoutes: document.querySelectorAll("#map .map-route-index a").length,
      mapIndexLabels: [...document.querySelectorAll("#map .map-route-index a strong")]
        .map((element) => element.textContent.trim())
        .sort(),
      mapText: document.querySelector("#map")?.textContent.replace(/\\s+/g, " ").trim() || "",
      activeRegionLabels: [...document.querySelectorAll("#panel-regions .region-nav a")]
        .map((link) => link.textContent.replace(/\\s+/g, " ").trim()),
      introText: document.querySelector(".intro")?.textContent.replace(/\\s+/g, " ").trim() || "",
      dialogueStayText: [...document.querySelectorAll(".dialog-stay-section")]
        .map((section) => section.textContent.replace(/\\s+/g, " ").trim())
        .join(" "),
      dialogSupported: typeof HTMLDialogElement !== "undefined",
      budgetMatches,
      images: document.images.length,
      brokenImages,
      loadedImages: document.querySelectorAll("img.image-loaded").length,
      pendingImageFrames: document.querySelectorAll("[data-image-frame].image-pending").length,
      asyncDecodedImages: document.querySelectorAll('img[decoding="async"]').length,
      eagerHighPriorityImages: document.querySelectorAll('img[loading="eager"][fetchpriority="high"]').length,
      imageFrames: document.querySelectorAll("[data-image-frame]").length,
      imageSpinnerCss: document.documentElement.innerHTML.includes(".image-pending::after")
    };
  })()`);

  const expectedRouteIds = [
    "02", "03", "04", "05", "12", "14", "16", "17", "f01",
    "p01", "s01", "s02", "s03", "s04"
  ].sort();
  const expectedMapLabels = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"
  ];

  assert(initial.topbars === 0 && initial.tripFacts === 0, `${prefix}: unused top header still renders`);
  assert(initial.rankRows === 14, `${prefix}: expected 14 ranking rows, got ${initial.rankRows}`);
  assert(
    initial.rankBoardPaddingLeft === 0 &&
      Math.abs(initial.firstRankRowLeft - initial.rankingContentLeft) <= 2,
    `${prefix}: ranking list has an unwanted left inset`
  );
  assert(
    initial.rankRowHeights.every((height) => height <= (mobile ? 420 : 400)),
    `${prefix}: ranking cards are too tall: ${initial.rankRowHeights.join(",")}`
  );
  assert(initial.routeCards === 14, `${prefix}: expected 14 route cards, got ${initial.routeCards}`);
  assert(initial.routeDialogs === 14, `${prefix}: expected 14 dialogs, got ${initial.routeDialogs}`);
  assert(initial.pageTitle === "出行计划", `${prefix}: page title should be 出行计划`);
  assert(
    initial.tabLabels.join(",") === "总榜,分区域,路线图",
    `${prefix}: unexpected tabs: ${initial.tabLabels.join(",")}`
  );
  assert(initial.selectedTab === "总榜", `${prefix}: 总榜 must be selected initially`);
  assert(
    initial.initialVisiblePanels.join(",") === "panel-ranking",
    `${prefix}: only the ranking panel should be visible initially`
  );
  assert(
    initial.initialHiddenPanels.join(",") === "panel-regions,panel-map",
    `${prefix}: region and map panels should start hidden`
  );
  assert(initial.regionNavCount === 1, `${prefix}: region navigation must render exactly once`);
  assert(initial.regionNavInsideRegions, `${prefix}: region navigation must live only inside 分区域`);
  assert(
    initial.regionNavLabels.join(",") === "青浦,金山,奉贤,浦东,苏州",
    `${prefix}: unexpected region navigation: ${initial.regionNavLabels.join(",")}`
  );
  assert(
    Math.abs(initial.placePhotoLeft - initial.stayPhotoLeft) <= 2,
    `${prefix}: scenic and stay images are not left aligned (${initial.placePhotoLeft}px vs ${initial.stayPhotoLeft}px)`
  );
  assert(
    initial.placePhotoWidth > initial.stayPhotoWidth &&
      initial.placePhotoHeight > initial.stayPhotoHeight,
    `${prefix}: scenic image must be larger than the stay thumbnail`
  );
  assert(initial.stayCards === 0, `${prefix}: independent stay cards must be removed`);
  assert(!initial.staySectionPresent, `${prefix}: independent stays section still exists`);
  assert(
    initial.routeIds.join(",") === expectedRouteIds.join(","),
    `${prefix}: unexpected route ids: ${initial.routeIds.join(",")}`
  );
  assert(initial.routeReviewCards === 14, `${prefix}: every route card needs a one-line review`);
  assert(initial.routeFeeCards === 14, `${prefix}: every route card needs a fee warning`);
  assert(initial.routePlaceReviews === 14, `${prefix}: every route card needs a source place review`);
  assert(initial.rankPlaceReviews === 14, `${prefix}: every ranking row needs a source place review`);
  assert(initial.dialogPlaceReviews === 14, `${prefix}: every dialog needs a source place review`);
  assert(initial.dialogReviewBlocks === 14, `${prefix}: every dialog needs a one-line review`);
  assert(initial.routeStayReferences === 14, `${prefix}: every route card needs a stay reference`);
  assert(initial.rankStayReferences === 14, `${prefix}: every ranking row needs a stay reference`);
  assert(initial.routeStayReferenceItems === 14, `${prefix}: route cards should show one primary stay each`);
  assert(initial.rankStayReferenceItems === 14, `${prefix}: ranking rows should show one primary stay each`);
  assert(initial.dialogStayCards === 25, `${prefix}: expected 25 full stay candidates, got ${initial.dialogStayCards}`);
  assert(initial.dialogStaySections === 14, `${prefix}: each dialog needs a stay section`);
  assert(initial.routeAmenityTags >= 14, `${prefix}: route cards are missing amenity tags`);
  assert(initial.dialogAmenityTags >= 50, `${prefix}: dialog stay cards are missing amenity tags`);
  assert(
    initial.rankTagCounts.length === 14 && initial.rankTagCounts.every((count) => count >= 1),
    `${prefix}: ranking rows are missing tags`
  );
  assert(initial.dialogueStayText.includes("订前先问"), `${prefix}: stay cards need booking checks`);
  assert(initial.dialogueStayText.includes("4间房适配"), `${prefix}: stay cards need 4-room fit notes`);
  assert(!initial.staySectionInDetails, `${prefix}: stays must not be folded into details`);
  assert(initial.dialogSupported, `${prefix}: native dialog support is required`);
  assert(!initial.legacyMapVisible, `${prefix}: legacy map markup must not render`);
  assert(initial.mapImagePresent && initial.mapImageLoaded, `${prefix}: real Amap image is missing`);
  assert(initial.mapImageSrc === "assets/amap-route-map-v5.png", `${prefix}: wrong map image source`);
  assert(initial.mapImageAlt.includes("高德实际地图底图"), `${prefix}: map image needs a real-map description`);
  assert(initial.mapIndexRoutes === 14, `${prefix}: expected 14 active routes in the map index`);
  assert(initial.mapImageNaturalWidth === 1000, `${prefix}: map should stay a high-density real image`);
  assert(initial.mapImageNaturalHeight <= 520, `${prefix}: map image is not cropped tightly enough`);
  assert(
    initial.mapFrameHeight <= (mobile ? 320 : 430),
    `${prefix}: map frame is too tall: ${initial.mapFrameHeight}px`
  );
  assert(
    initial.mapIndexLabels.join(",") === expectedMapLabels.join(","),
    `${prefix}: unexpected map labels: ${initial.mapIndexLabels.join(",")}`
  );
  assert(initial.mapText.includes("红色 S 是陆家嘴"), `${prefix}: map must identify the S origin`);
  assert(initial.mapText.includes("住宿放在对应路线里"), `${prefix}: map must connect stays to routes`);
  assert(initial.mapText.includes("高德驾车"), `${prefix}: map index must show Amap drive times`);
  assert(
    initial.activeRegionLabels.join(",") === "青浦,金山,奉贤,浦东,苏州",
    `${prefix}: unexpected in-panel navigation: ${initial.activeRegionLabels.join(",")}`
  );
  assert(initial.introText.includes("住宿直接跟着对应玩法走"), `${prefix}: intro must connect stays to play`);
  assert(!initial.introText.includes("住宿放在最后"), `${prefix}: intro still de-emphasizes stays`);
  assert(!initial.introText.includes("90 分钟内"), `${prefix}: stale 90-minute limit remains`);
  assert(initial.travelMinutes.length === 14, `${prefix}: expected 14 drive-time labels`);
  assert(initial.travelMinutes.includes(131) && initial.travelMinutes.includes(123), `${prefix}: long routes were removed`);
  assert(initial.travelMinutes.some((minutes) => minutes > 90), `${prefix}: route times are still capped at 90 minutes`);
  assert(!initial.horizontalOverflow, `${prefix}: horizontal page overflow detected`);
  assert(
    initial.overflowElements.length === 0,
    `${prefix}: child elements exceed the viewport: ${JSON.stringify(initial.overflowElements)}`
  );
  assert(initial.brokenImages.length === 0, `${prefix}: broken images: ${initial.brokenImages.join(", ")}`);
  assert(initial.loadedImages === initial.images, `${prefix}: image load state tracking is incomplete`);
  assert(initial.pendingImageFrames === 0, `${prefix}: image loading frames did not clear after load`);
  assert(initial.asyncDecodedImages === initial.images, `${prefix}: images need async decoding`);
  assert(initial.eagerHighPriorityImages >= 2, `${prefix}: first ranking images need eager high priority`);
  assert(initial.imageFrames >= 30, `${prefix}: image spinner frames are missing`);
  assert(initial.imageSpinnerCss, `${prefix}: image spinner styles are missing`);
  assert(
    initial.feeReminderTerms.join(",") === "票价,另收费,收费先问",
    `${prefix}: fee reminders are incomplete: ${initial.feeReminderTerms.join(",")}`
  );
  assert(
    initial.rankScenicImageSrcs.length === 14 &&
      initial.rankScenicImageSrcs.every((src) =>
        src.includes("assets/routes/") && !src.includes("assets/stays/")
      ),
    `${prefix}: ranking scenic images must come from route assets`
  );
  assert(initial.budgetMatches.length === 0, `${prefix}: budget terms remain: ${initial.budgetMatches.join(", ")}`);
  assert(initial.bodyFont >= 20, `${prefix}: body text is too small`);
  assert(initial.routeTitleFont >= 28, `${prefix}: route titles are too small`);
  assert(initial.rankTitleFont >= 20, `${prefix}: ranking titles are too small`);
  assert(initial.rankReviewFont >= 15, `${prefix}: ranking review text is too small`);
  assert(initial.reviewFont >= 18, `${prefix}: review text is too small`);
  assert(initial.stayReferenceNameFont >= 15, `${prefix}: stay reference names are too small`);
  assert(
    initial.rankScores.every((score, index) => index === 0 || initial.rankScores[index - 1] >= score),
    `${prefix}: ranking is not sorted by score: ${initial.rankScores.join(",")}`
  );
  assert(
    initial.routeTitles.some((title) => title.includes("太湖东山")) &&
      !initial.routeTitles.some((title) => title.includes("东平森林公园")) &&
      initial.routeTitles.some((title) => title.includes("碧海金沙")),
    `${prefix}: route list does not match the current 14-route scope`
  );
  assert(
    Object.values(initial.regionRouteScores).every((scores) =>
      scores.every((score, index) => index === 0 || scores[index - 1] >= score)
    ),
    `${prefix}: region routes are not sorted by score: ${JSON.stringify(initial.regionRouteScores)}`
  );

  const tabClickState = await evaluate(send, `(() => {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const panels = [...document.querySelectorAll('[role="tabpanel"]')];
    const snapshot = () => ({
      selected: tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.textContent.trim() || "",
      visiblePanels: panels.filter((panel) => !panel.hidden).map((panel) => panel.id),
      focusedTab: document.activeElement?.closest?.('[role="tab"]')?.textContent.trim() || ""
    });

    document.getElementById("tab-regions").click();
    const regions = snapshot();
    document.getElementById("tab-map").click();
    const map = snapshot();
    document.getElementById("tab-ranking").click();
    const ranking = snapshot();
    return { regions, map, ranking };
  })()`);
  assert(tabClickState.regions.selected === "分区域", `${prefix}: clicking 分区域 did not select it`);
  assert(
    tabClickState.regions.visiblePanels.join(",") === "panel-regions",
    `${prefix}: 分区域 exposed the wrong panels`
  );
  assert(tabClickState.map.selected === "路线图", `${prefix}: clicking 路线图 did not select it`);
  assert(tabClickState.map.visiblePanels.join(",") === "panel-map", `${prefix}: 路线图 exposed the wrong panels`);

  const mapVisibleState = await evaluate(send, `(() => {
    document.getElementById("tab-map").click();
    const frame = document.querySelector("#map .map-frame").getBoundingClientRect();
    const image = document.querySelector("#map .region-map-photo").getBoundingClientRect();
    const imageStyle = getComputedStyle(document.querySelector("#map .region-map-photo"));
    return {
      frameLeft: Math.round(frame.left),
      frameRight: Math.round(frame.right),
      frameHeight: Math.round(frame.height),
      imageLeft: Math.round(image.left),
      imageRight: Math.round(image.right),
      imageHeight: Math.round(image.height),
      cssWidth: imageStyle.width,
      cssMinWidth: imageStyle.minWidth,
      cssMaxWidth: imageStyle.maxWidth,
      cssObjectFit: imageStyle.objectFit,
      cssTransform: imageStyle.transform
    };
  })()`);
  assert(
    mapVisibleState.imageLeft <= mapVisibleState.frameLeft + 1 &&
      mapVisibleState.imageRight >= mapVisibleState.frameRight - 1,
    `${prefix}: cropped map image does not fill its frame: ${JSON.stringify(mapVisibleState)}`
  );
  assert(
    mapVisibleState.frameHeight >= (mobile ? 230 : 320) &&
      mapVisibleState.frameHeight <= (mobile ? 320 : 430),
    `${prefix}: map frame has an unexpected height: ${mapVisibleState.frameHeight}px`
  );
  assert(tabClickState.ranking.selected === "总榜", `${prefix}: clicking 总榜 did not select it`);
  assert(
    tabClickState.ranking.visiblePanels.join(",") === "panel-ranking",
    `${prefix}: 总榜 exposed the wrong panels`
  );

  await evaluate(send, `document.getElementById("tab-ranking").focus()`);
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "ArrowRight",
    code: "ArrowRight",
    windowsVirtualKeyCode: 39
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "ArrowRight",
    code: "ArrowRight",
    windowsVirtualKeyCode: 39
  });
  await sleep(80);
  const keyboardTabState = await evaluate(send, `(() => {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const panels = [...document.querySelectorAll('[role="tabpanel"]')];
    return {
      selected: tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.textContent.trim() || "",
      visiblePanels: panels.filter((panel) => !panel.hidden).map((panel) => panel.id),
      focusedTab: document.activeElement?.textContent.trim() || ""
    };
  })()`);
  assert(keyboardTabState.selected === "分区域", `${prefix}: ArrowRight did not select 分区域`);
  assert(
    keyboardTabState.visiblePanels.join(",") === "panel-regions",
    `${prefix}: ArrowRight exposed the wrong panel`
  );
  assert(keyboardTabState.focusedTab === "分区域", `${prefix}: ArrowRight did not move focus`);

  const openedFromRank = await evaluate(send, `(async () => {
    document.getElementById("tab-ranking").click();
    const row = document.querySelector(".rank-row");
    row.click();
    await new Promise((resolve) => setTimeout(resolve, 150));
    const dialog = document.getElementById(row.getAttribute("aria-controls"));
    const textFont = (selector) => {
      const element = dialog.querySelector(selector);
      return element ? parseFloat(getComputedStyle(element).fontSize) : null;
    };
    const timeline = dialog.querySelector(".timeline");
    const timelineBefore = timeline ? getComputedStyle(timeline, "::before") : null;
    const timelineItem = timeline?.querySelector("li");
    const timelineItemStyle = timelineItem ? getComputedStyle(timelineItem) : null;
    const state = {
      open: dialog.open,
      title: dialog.querySelector("h2").textContent.trim(),
      hasScoreParts: dialog.querySelectorAll(".score-parts > span").length === 4,
      hasPlaceReview: Boolean(dialog.querySelector(".place-review-meta--dialog")),
      hasReview: Boolean(dialog.querySelector(".dialog-review")),
      hasFee: Boolean(dialog.querySelector(".fee-line")),
      stayCards: dialog.querySelectorAll(".dialog-stay-card").length,
      amenityText: dialog.querySelector(".dialog-stay-section").textContent.replace(/\\s+/g, " "),
      hasStaySource: [...dialog.querySelectorAll(".dialog-stay-card a")].every((link) => /^https?:/.test(link.href)),
      heroHeight: Math.round(dialog.querySelector(".dialog-hero").getBoundingClientRect().height),
      heroTitleFont: textFont(".dialog-hero h2"),
      scoreFont: textFont(".score-heading > div strong"),
      stayReviewFont: textFont(".dialog-stay-review"),
      timelineFont: timelineItemStyle ? parseFloat(timelineItemStyle.fontSize) : null,
      timelineRailWidth: timelineBefore ? parseFloat(timelineBefore.width) : 0,
      timelineItemBorderTopWidth: timelineItemStyle ? parseFloat(timelineItemStyle.borderTopWidth) : 0
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
  assert(openedFromRank.stayCards >= 1, `${prefix}: dialog should show full stay candidates`);
  assert(openedFromRank.hasStaySource, `${prefix}: dialog stay cards need source links`);
  assert(
    /独栋|麻将\/棋牌|KTV|烧烤|泳池|院子/.test(openedFromRank.amenityText),
    `${prefix}: dialog stay cards need multiplayer amenity tags`
  );
  assert(openedFromRank.closedByButton, `${prefix}: close button did not close the dialog`);
  assert(
    openedFromRank.heroHeight <= (mobile ? 240 : 330),
    `${prefix}: dialog hero is too tall: ${openedFromRank.heroHeight}px`
  );
  assert(
    openedFromRank.heroTitleFont <= (mobile ? 27 : 34),
    `${prefix}: dialog title is too large: ${openedFromRank.heroTitleFont}px`
  );
  assert(
    openedFromRank.scoreFont <= (mobile ? 36 : 40),
    `${prefix}: dialog score is too large: ${openedFromRank.scoreFont}px`
  );
  assert(
    openedFromRank.stayReviewFont <= 15.5,
    `${prefix}: dialog stay copy is too large: ${openedFromRank.stayReviewFont}px`
  );
  assert(
    openedFromRank.timelineFont <= 15.5,
    `${prefix}: dialog timeline copy is too large: ${openedFromRank.timelineFont}px`
  );
  assert(
    openedFromRank.timelineRailWidth >= 2 && openedFromRank.timelineItemBorderTopWidth === 0,
    `${prefix}: timeline needs a visible vertical rail instead of row separators`
  );

  const openedFromCard = await evaluate(send, `(async () => {
    document.getElementById("tab-regions").click();
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

  await evaluate(send, `document.getElementById("tab-ranking").click()`);
  await evaluate(send, "scrollTo(0, 0)");
  console.error(`Capturing ${prefix} screenshots...`);
  await sleep(150);
  await capture(send, `${prefix}-top.png`);

  await evaluate(send, `(() => {
    document.getElementById("tab-ranking").click();
    const section = document.querySelector("#ranking");
    scrollTo(0, Math.max(0, section.offsetTop - 132));
  })()`);
  await sleep(200);
  await capture(send, `${prefix}-ranking.png`);

  await evaluate(send, `(() => {
    document.getElementById("tab-regions").click();
    const section = document.querySelector(".region-section");
    scrollTo(0, Math.max(0, section.offsetTop - 132));
  })()`);
  await sleep(200);
  await capture(send, `${prefix}-routes.png`);

  await evaluate(send, `(() => {
    document.getElementById("tab-map").click();
    const section = document.querySelector("#map");
    const frame = section.querySelector(".map-frame");
    scrollTo(0, Math.max(0, section.offsetTop - 132));
  })()`);
  await sleep(200);
  await capture(send, `${prefix}-map.png`);

  await evaluate(send, `(() => {
    document.getElementById("tab-ranking").click();
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
  await evaluate(send, `(() => {
    const body = document.querySelector("dialog.route-dialog[open] .route-dialog-body");
    const section = body?.querySelector(".route-detail");
    if (!body || !section) return;
    const bodyTop = body.getBoundingClientRect().top;
    const sectionTop = section.getBoundingClientRect().top;
    body.scrollTop += sectionTop - bodyTop - 12;
  })()`);
  await sleep(180);
  await capture(send, `${prefix}-route-dialog-timeline.png`);
  await evaluate(send, `document.querySelector("dialog.route-dialog[open]")?.close()`);

  return {
    ...initial,
    dialogRankTitle: openedFromRank.title,
    dialogOpenedFromRank: openedFromRank.open,
    dialogOpenedFromCard: openedFromCard.open,
    dialogActiveInside: openedFromCard.activeInside,
    dialogClosedByButton: openedFromRank.closedByButton,
    dialogClosedByEscape: closedByEscape.closed,
    mapVisibleState,
    dialogLayout: {
      heroHeight: openedFromRank.heroHeight,
      heroTitleFont: openedFromRank.heroTitleFont,
      scoreFont: openedFromRank.scoreFont,
      stayReviewFont: openedFromRank.stayReviewFont,
      timelineFont: openedFromRank.timelineFont,
      timelineRailWidth: openedFromRank.timelineRailWidth,
      timelineItemBorderTopWidth: openedFromRank.timelineItemBorderTopWidth
    }
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
