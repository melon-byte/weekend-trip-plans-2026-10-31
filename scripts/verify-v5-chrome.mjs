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
const imageFileStats = referencedImagePaths.filter((assetPath) => /\.(png|jpe?g|webp)$/.test(assetPath)).map((assetPath) => {
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
    const intro = document.querySelector(".intro");
    const introStyle = intro ? getComputedStyle(intro) : null;
    const tabShell = document.querySelector(".trip-tab-shell");
    const regionSections = [...document.querySelectorAll("#panel-regions .region-section")];
    const regionRouteDistances = Object.fromEntries(regionSections.map((section) => [
      section.id,
      [...section.querySelectorAll(".route-card")].map((card) =>
        Number(card.querySelector(".route-kicker span:last-child")?.textContent.match(/([\\d.]+) km/)?.[1])
      )
    ]));
    const mapRouteDistances = [
      [...document.querySelectorAll("#map .map-route-index a")].map((link) =>
        Number(link.querySelector("small")?.textContent.match(/([\\d.]+) km/)?.[1])
      )
    ];
    const docWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const overflowElements = [...document.querySelectorAll("main *")]
      .filter((element) => !element.closest(".region-nav"))
      .filter((element) => !element.closest(".map-frame"))
      .filter((element) => !element.closest(".stay-reference--row .stay-reference-list"))
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
      rankingHeaderVisible: Boolean(document.querySelector("#panel-ranking .ranking-heading")),
      rankingScoringCopyVisible: document.querySelector("#panel-ranking")?.textContent.includes("白天体验 45") || false,
      regionNavHeadingVisible: Boolean(document.querySelector("#panel-regions .region-panel-nav > p")),
      mapHeadingVisible: Boolean(document.querySelector("#panel-map .map-heading")),
      introPaddingTop: introStyle ? parseFloat(introStyle.paddingTop) : null,
      introPaddingBottom: introStyle ? parseFloat(introStyle.paddingBottom) : null,
      tabShellPaddingBottom: tabShell ? parseFloat(getComputedStyle(tabShell).paddingBottom) : null,
      tabHeight: document.querySelector(".trip-tab")?.getBoundingClientRect().height || 0,
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
      overflowingStayCarousels: [...document.querySelectorAll(".rank-row .stay-reference--row .stay-reference-list")]
        .filter((list) => list.scrollWidth > list.clientWidth + 1).length,
      dialogStayCards: document.querySelectorAll(".dialog-stay-card").length,
      dialogStaySections: document.querySelectorAll(".dialog-stay-section").length,
      routeAmenityTags: document.querySelectorAll(".route-card .stay-amenities span").length,
      dialogAmenityTags: document.querySelectorAll(".dialog-stay-card .stay-amenities span").length,
      rankScores: rankRows.map((row) => Number(row.querySelector(".row-score b").textContent)),
      rankTitles: rankRows.map((row) => row.querySelector(".row-main > strong").textContent.trim()),
      routeTitles: routeCards.map((card) => card.querySelector(".route-title").textContent.trim()),
      regionRouteScores,
      regionRouteDistances,
      mapRouteDistances,
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
      mapMarkerCount: document.querySelectorAll("#map .map-extra-stop").length,
      mapMarkerRouteIds: [...document.querySelectorAll("#map .map-extra-stop")]
        .map((marker) => marker.dataset.routeId).sort(),
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
    "02", "03", "04", "05", "12", "14", "16", "f01",
    "r01", "r02", "s01", "s02", "s03", "s04", "s05", "j01"
  ].sort();
  const expectedRouteCount = expectedRouteIds.length;
  const expectedMapLabels = [
    "A", "B", "C", "D", "E", "F", "G", "H", "K", "L", "M", "N", "O", "P", "Q", "R"
  ];

  assert(initial.topbars === 0 && initial.tripFacts === 0, `${prefix}: unused top header still renders`);
  assert(initial.rankRows === expectedRouteCount, `${prefix}: expected ${expectedRouteCount} ranking rows, got ${initial.rankRows}`);
  assert(
    initial.rankBoardPaddingLeft === 0 &&
      Math.abs(initial.firstRankRowLeft - initial.rankingContentLeft) <= 2,
    `${prefix}: ranking list has an unwanted left inset`
  );
  assert(
    initial.rankRowHeights.every((height) => height <= (mobile ? 420 : 400)),
    `${prefix}: ranking cards are too tall: ${initial.rankRowHeights.join(",")}`
  );
  assert(initial.routeCards === expectedRouteCount, `${prefix}: expected ${expectedRouteCount} route cards, got ${initial.routeCards}`);
  assert(initial.routeDialogs === expectedRouteCount, `${prefix}: expected ${expectedRouteCount} dialogs, got ${initial.routeDialogs}`);
  assert(initial.pageTitle === "出行计划", `${prefix}: page title should be 出行计划`);
  assert(
    initial.tabLabels.join(",") === "总榜,分区域,路线图",
    `${prefix}: unexpected tabs: ${initial.tabLabels.join(",")}`
  );
  assert(initial.selectedTab === "总榜", `${prefix}: 总榜 must be selected initially`);
  assert(!initial.rankingHeaderVisible && !initial.rankingScoringCopyVisible,
    `${prefix}: ranking heading and scoring explanation should be removed`);
  assert(!initial.regionNavHeadingVisible, `${prefix}: region navigation heading should be removed`);
  assert(!initial.mapHeadingVisible, `${prefix}: map heading should be removed`);
  assert(initial.introPaddingTop <= 12 && initial.introPaddingBottom <= 8,
    `${prefix}: page title spacing is not compact`);
  assert(initial.tabShellPaddingBottom <= 8 && initial.tabHeight <= 50,
    `${prefix}: tab bar spacing is not compact`);
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
    initial.regionNavLabels.join(",") === "浦东,近郊体验,奉贤,青浦,金山,苏州,嘉兴",
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
  assert(initial.routeReviewCards === expectedRouteCount, `${prefix}: every route card needs a one-line review`);
  assert(initial.routeFeeCards === expectedRouteCount, `${prefix}: every route card needs a fee warning`);
  assert(initial.routePlaceReviews === expectedRouteCount, `${prefix}: every route card needs a source place review`);
  assert(initial.rankPlaceReviews === expectedRouteCount, `${prefix}: every ranking row needs a source place review`);
  assert(initial.dialogPlaceReviews === expectedRouteCount, `${prefix}: every dialog needs a source place review`);
  assert(initial.dialogReviewBlocks === expectedRouteCount, `${prefix}: every dialog needs a one-line review`);
  assert(initial.routeStayReferences === expectedRouteCount, `${prefix}: every route card needs a stay reference`);
  assert(initial.rankStayReferences === expectedRouteCount, `${prefix}: every ranking row needs a stay reference`);
  assert(initial.routeStayReferenceItems === expectedRouteCount, `${prefix}: route cards should show one primary stay each`);
  assert(initial.rankStayReferenceItems === 31, `${prefix}: ranking rows should show all linked stay candidates`);
  assert(!mobile || initial.overflowingStayCarousels > 0, `${prefix}: mobile stay cards should scroll horizontally`);
  assert(initial.dialogStayCards === 31, `${prefix}: expected 31 full stay candidates, got ${initial.dialogStayCards}`);
  assert(initial.dialogStaySections === expectedRouteCount, `${prefix}: each dialog needs a stay section`);
  assert(initial.routeAmenityTags >= expectedRouteCount, `${prefix}: route cards are missing amenity tags`);
  assert(initial.dialogAmenityTags >= 50, `${prefix}: dialog stay cards are missing amenity tags`);
  assert(
    initial.rankTagCounts.length === expectedRouteCount && initial.rankTagCounts.every((count) => count >= 1),
    `${prefix}: ranking rows are missing tags`
  );
  assert(initial.dialogueStayText.includes("订前先问"), `${prefix}: stay cards need booking checks`);
  assert(initial.dialogueStayText.includes("4间房适配"), `${prefix}: stay cards need 4-room fit notes`);
  assert(!initial.staySectionInDetails, `${prefix}: stays must not be folded into details`);
  assert(initial.dialogSupported, `${prefix}: native dialog support is required`);
  assert(!initial.legacyMapVisible, `${prefix}: legacy map markup must not render`);
  assert(initial.mapImagePresent && initial.mapImageLoaded, `${prefix}: real Amap image is missing`);
  assert(initial.mapImageSrc === "assets/amap-route-basemap-v6.png", `${prefix}: old pins must not remain in the basemap`);
  assert(initial.mapImageAlt.includes("高德实际地图底图"), `${prefix}: map image needs a real-map description`);
  assert(initial.mapIndexRoutes === expectedRouteCount, `${prefix}: expected ${expectedRouteCount} active routes in the map index`);
  assert(initial.mapMarkerCount === expectedRouteCount, `${prefix}: every route must have an image marker`);
  assert(initial.mapMarkerRouteIds.join(",") === expectedRouteIds.join(","),
    `${prefix}: clickable map markers do not cover the active routes`);
  assert(initial.mapImageNaturalWidth === 1000, `${prefix}: map should stay a high-density real image`);
  assert(initial.mapImageNaturalHeight <= 620, `${prefix}: map image is not cropped tightly enough`);
  assert(
    initial.mapFrameHeight <= (mobile ? 320 : 430),
    `${prefix}: map frame is too tall: ${initial.mapFrameHeight}px`
  );
  assert(
    initial.mapIndexLabels.join(",") === expectedMapLabels.join(","),
    `${prefix}: unexpected map labels: ${initial.mapIndexLabels.join(",")}`
  );
  assert(initial.mapText.includes("陆家嘴 S · 出发点"), `${prefix}: map must identify the S origin`);
  assert(initial.mapText.includes("地图字母对应下方路线；点击标记打开详情"), `${prefix}: map marker legend is missing`);
  assert(initial.mapText.includes("高德驾车"), `${prefix}: map index must show Amap drive times`);
  assert(
    initial.activeRegionLabels.join(",") === "浦东,近郊体验,奉贤,青浦,金山,苏州,嘉兴",
    `${prefix}: unexpected in-panel navigation: ${initial.activeRegionLabels.join(",")}`
  );
  assert(initial.introText.includes("玩优先"), `${prefix}: intro must keep the trip focused on activities`);
  assert(!initial.introText.includes("住宿放在最后"), `${prefix}: intro still de-emphasizes stays`);
  assert(!initial.introText.includes("90 分钟内"), `${prefix}: stale 90-minute limit remains`);
  assert(initial.travelMinutes.length === expectedRouteCount, `${prefix}: expected ${expectedRouteCount} drive-time labels`);
  assert(initial.travelMinutes.some((minutes) => minutes >= 120), `${prefix}: longest routes were removed`);
  assert(initial.travelMinutes.some((minutes) => minutes > 90), `${prefix}: route times are still capped at 90 minutes`);
  const ascending = (distances) => distances.every((distance, index) =>
    Number.isFinite(distance) && (index === 0 || distances[index - 1] <= distance)
  );
  assert(Object.values(initial.regionRouteDistances).every(ascending),
    `${prefix}: routes within each region are not sorted nearest-first`);
  assert(initial.mapRouteDistances.every(ascending),
    `${prefix}: map routes are not globally sorted nearest-first`);
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
    initial.rankScenicImageSrcs.length === expectedRouteCount &&
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
    `${prefix}: route list does not match the current ${expectedRouteCount}-route scope`
  );
  assert(
    Object.values(initial.regionRouteScores).flat().length === expectedRouteCount,
    `${prefix}: region route list does not cover all ${expectedRouteCount} routes`
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

  const mapVisibleState = await evaluate(send, `(async () => {
    document.getElementById("tab-map").click();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const raster = document.querySelector("#map .route-basemap");
    if (!raster) return {mapMissing: true};
    await raster.decode();
    const frame = document.querySelector("#map .map-frame").getBoundingClientRect();
    const image = raster.getBoundingClientRect();
    const overlay = document.querySelector("#map [data-amap-overlay]");
    const markerElements = [...overlay.querySelectorAll("[data-map-stop]")];
    const markers = markerElements.map((marker) => {
      const rect = marker.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const expectedX = image.left + Number(marker.dataset.mapX) / raster.naturalWidth * image.width;
      const expectedY = image.top + Number(marker.dataset.mapY) / raster.naturalHeight * image.height;
      return {
        routeId: marker.dataset.routeId,
        left: rect.left - frame.left,
        top: rect.top - frame.top,
        right: rect.right - frame.left,
        bottom: rect.bottom - frame.top,
        error: Math.hypot(centerX - expectedX, centerY - expectedY)
      };
    });
    return {
      frameLeft: Math.round(frame.left),
      frameRight: Math.round(frame.right),
      frameHeight: Math.round(frame.height),
      imageLeft: Math.round(image.left),
      imageRight: Math.round(image.right),
      imageHeight: Math.round(image.height),
      imageTop: Math.round(image.top),
      imageBottom: Math.round(image.bottom),
      frameTop: Math.round(frame.top),
      frameBottom: Math.round(frame.bottom),
      markerCount: markers.length,
      markerRouteIds: markers.map((marker) => marker.routeId).sort(),
      markerPositionsInsideImage: markers.every((marker) =>
        marker.left >= 0 && marker.top >= 0 && marker.right <= frame.width && marker.bottom <= frame.height
      ),
      maximumCoordinateError: Math.max(...markers.map((marker) => marker.error)),
      taihuMarkersPresent: ["s03", "s04"].every((id) => markers.some((marker) => marker.routeId === id)),
      leaderLineCount: overlay.querySelectorAll("[data-map-leaders] line").length,
      markers
    };
  })()`);
  assert(!mapVisibleState.mapMissing, `${prefix}: interactive map did not initialize`);
  assert(
    mapVisibleState.imageLeft >= mapVisibleState.frameLeft &&
      mapVisibleState.imageRight <= mapVisibleState.frameRight &&
      mapVisibleState.imageTop >= mapVisibleState.frameTop &&
      mapVisibleState.imageBottom <= mapVisibleState.frameBottom,
    `${prefix}: the complete map must be visible without clipping: ${JSON.stringify(mapVisibleState)}`
  );
  assert(
    mapVisibleState.frameHeight >= (mobile ? 210 : 320) &&
      mapVisibleState.frameHeight <= (mobile ? 320 : 430),
    `${prefix}: map frame has an unexpected height: ${mapVisibleState.frameHeight}px`
  );
  assert(mapVisibleState.markerCount === expectedRouteCount, `${prefix}: all map stops need clickable markers`);
  assert(mapVisibleState.markerRouteIds.join(",") === expectedRouteIds.join(","),
    `${prefix}: map marker route ids are incomplete`);
  assert(mapVisibleState.markerPositionsInsideImage,
    `${prefix}: a map marker is outside the image frame`);
  assert(mapVisibleState.maximumCoordinateError < 1.6,
    `${prefix}: map marker coordinates differ from the basemap (${mapVisibleState.maximumCoordinateError}px)`);
  assert(mapVisibleState.taihuMarkersPresent, `${prefix}: both Taihu routes must remain visible`);
  assert(mapVisibleState.leaderLineCount === 0,
    `${prefix}: map markers must stay at their actual locations`);
  {
    const mapMarkerClickState = await evaluate(send, `(async () => {
      const outcomes = [];
      for (const marker of document.querySelectorAll("#map [data-map-stop]")) {
        const routeId = marker.dataset.routeId;
        marker.click();
        document.querySelector('[data-map-choice="' + routeId + '"]')?.click();
        const dialog = document.getElementById("route-dialog-" + routeId);
        const opened = Boolean(dialog?.open);
        if (opened) dialog.querySelector("[data-close-dialog]").click();
        outcomes.push({ routeId, opened, closed: !dialog?.open });
      }
      return outcomes;
    })()`);
    assert(mapMarkerClickState.length === expectedRouteCount && mapMarkerClickState.every((result) => result.opened && result.closed),
      `${prefix}: some map markers do not open their own route dialog: ${JSON.stringify(mapMarkerClickState)}`);
  }

  for (const routeId of expectedRouteIds) {
    const target = await evaluate(send, `(async () => {
      document.getElementById("tab-map").click();
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const frame = document.querySelector("#map .map-frame");
      scrollTo(0, Math.max(0, frame.getBoundingClientRect().top + scrollY - 100));
      const marker = [...frame.querySelectorAll("[data-map-stop]")]
        .find((element) => element.dataset.routeId === ${JSON.stringify(routeId)});
      const rect = marker.getBoundingClientRect();
      return {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
    })()`);
    await send("Input.dispatchMouseEvent", {type: "mouseMoved", ...target});
    await send("Input.dispatchMouseEvent", {type: "mousePressed", button: "left", clickCount: 1, ...target});
    await send("Input.dispatchMouseEvent", {type: "mouseReleased", button: "left", clickCount: 1, ...target});
    const clicked = await evaluate(send, `(() => {
      document.querySelector('[data-map-choice="${routeId}"]')?.click();
      const dialog = document.getElementById("route-dialog-${routeId}");
      const open = Boolean(dialog?.open);
      if (open) dialog.querySelector("[data-close-dialog]").click();
      return {
        open,
        target: ${JSON.stringify(target)},
        currentMarker: (() => {
          const rect = document.querySelector('#map [data-route-id="${routeId}"]')?.getBoundingClientRect();
          return rect ? {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2} : null;
        })(),
        otherDialog: document.querySelector("dialog[open]")?.id,
        choices: [...document.querySelectorAll("[data-map-choice]")].map((button) => button.dataset.mapChoice),
        hit: document.elementFromPoint(${target.x}, ${target.y})?.outerHTML.slice(0, 300)
      };
    })()`);
    if (!clicked.open) await capture(send, `${prefix}-map-pointer-error.png`);
    assert(clicked.open, `${prefix}: pointer click could not select map route ${routeId}: ${JSON.stringify(clicked)}`);
  }

  const zoomState = await evaluate(send, `(async () => {
    document.getElementById("tab-map").click();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const raster = document.querySelector("#map .route-basemap");
    const before = raster.getBoundingClientRect().width;
    document.querySelector("#map .leaflet-control-zoom-in").click();
    await new Promise((resolve) => setTimeout(resolve, 300));
    const image = raster.getBoundingClientRect();
    const errors = [...document.querySelectorAll("#map [data-map-stop]")].map((marker) => {
      const rect = marker.getBoundingClientRect();
      return Math.hypot(
        rect.left + rect.width / 2 - image.left - Number(marker.dataset.mapX) / raster.naturalWidth * image.width,
        rect.top + rect.height / 2 - image.top - Number(marker.dataset.mapY) / raster.naturalHeight * image.height
      );
    });
    document.querySelector("#map .leaflet-control-zoom-out").click();
    return {before, after: image.width, maximumCoordinateError: Math.max(...errors)};
  })()`);
  assert(zoomState.after > zoomState.before * 1.4, `${prefix}: map zoom control did not magnify the map`);
  assert(zoomState.maximumCoordinateError < 1.6, `${prefix}: map coordinates drifted after zoom`);
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
    const opener = row.querySelector(".rank-row-open");
    opener.click();
    await new Promise((resolve) => setTimeout(resolve, 150));
    const dialog = document.getElementById(opener.getAttribute("aria-controls"));
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
  await evaluate(send, "document.activeElement?.blur()");
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
    const button = document.querySelector(".rank-row-open");
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
