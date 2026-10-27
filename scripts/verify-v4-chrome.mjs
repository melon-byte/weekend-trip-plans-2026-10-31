import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const htmlPath = path.join(root, "weekend-trip-plans-2026-10-31-v4.html");
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
    const routeDetails = [...document.querySelectorAll(".route-card details")];
    const routeCards = [...document.querySelectorAll(".route-card")];
    const stayCards = [...document.querySelectorAll(".stay-card")];
    const staySection = document.querySelector("#stays");
    const docWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const overflowElements = [...document.querySelectorAll("main *")]
      .filter((element) => !element.closest(".region-nav"))
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
    return {
      viewport: [innerWidth, innerHeight],
      documentWidth: docWidth,
      horizontalOverflow: docWidth > innerWidth + 1,
      overflowElements,
      bodyFont: textFont("body"),
      routeTitleFont: textFont(".route-summary h3"),
      stayTitleFont: textFont(".stay-section-heading h2"),
      routeCards: routeCards.length,
      stayCards: stayCards.length,
      routeDetails: routeDetails.length,
      staySectionPresent: Boolean(staySection),
      staySectionVisible: staySection ? getComputedStyle(staySection).display !== "none" : false,
      stayCardVisible: stayCards[0] ? stayCards[0].getBoundingClientRect().height > 0 : false,
      staySectionInDetails: Boolean(document.querySelector(".stay-section details")),
      images: document.images.length,
      brokenImages
    };
  })()`);

  const routeToggle = await evaluate(send, `(async () => {
    const details = document.querySelector(".route-card details");
    const summary = details.querySelector("summary");
    summary.click();
    await new Promise((resolve) => setTimeout(resolve, 150));
    const opened = details.open;
    details.open = false;
    return opened;
  })()`);

  await evaluate(send, "scrollTo(0, 0)");
  console.error(`Capturing ${prefix} screenshots...`);
  await sleep(150);
  await capture(send, `${prefix}-top.png`);

  await evaluate(send, `(() => {
    const section = document.querySelector("#stays");
    scrollTo(0, Math.max(0, section.offsetTop - 132));
  })()`);
  await sleep(200);
  await capture(send, `${prefix}-stays.png`);

  return { ...initial, routeToggle };
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
