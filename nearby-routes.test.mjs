import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, "index.html"), "utf8");
const builderPath = path.join(here, "scripts", "build-v5.mjs");
const builder = fs.readFileSync(builderPath, "utf8");
const mapRenderer = fs.readFileSync(path.join(here, "scripts", "render-v5-map.mjs"), "utf8");

test("the page generator parses as valid JavaScript", () => {
  const result = spawnSync(process.execPath, ["--check", builderPath], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || "generator syntax check failed");
});

test("the published guide includes the two farther overnight experience routes", () => {
  assert.ok(html.includes("广富林遗址 · 水下展馆"), "missing Songjiang route");
  assert.ok(html.includes("嘉定秋收 · 菊园百果园"), "missing Jiading route");
  assert.ok(html.includes("高德驾车 43.8 km · 约 70 分钟"), "stale Songjiang drive time");
  assert.ok(html.includes("高德驾车 42.5 km · 约 60 分钟"), "stale Jiading drive time");
});

test("each new route image exists as a local scenic asset", () => {
  for (const image of ["nearby-songjiang.jpg", "nearby-jiading.jpg"]) {
    assert.ok(
      fs.existsSync(path.join(here, "assets", "routes", image)),
      `missing local route photo ${image}`
    );
  }
});

test("the guide generator and published page exclude downtown overnight routes", () => {
  for (const title of ["淮海路手作 · 陶艺", "科技馆＋上博东馆", "VR＋飞行模拟"]) {
    assert.ok(!builder.includes(title), `generator still includes ${title}`);
    assert.ok(!html.includes(title), `published guide still includes ${title}`);
  }
});

test("nearby route reviews contain attraction ratings, not hotel or product ratings", () => {
  const extractPlaceReview = (id) => {
    const start = builder.indexOf(`id: "${id}",\n    group: "nearby"`);
    const reviewStart = builder.indexOf("    placeReview:", start);
    const reviewEnd = builder.indexOf("    rating:", reviewStart);
    return builder.slice(reviewStart, reviewEnd);
  };
  const songjiangReview = extractPlaceReview("r01");
  const jiadingReview = extractPlaceReview("r02");

  assert.ok(songjiangReview.includes('source: "高德", score: "4.7"'));
  assert.ok(!songjiangReview.includes("宰相府酒店"), "hotel scores must stay in accommodation cards");
  assert.ok(!jiadingReview.includes('source: "携程"'), "a ticket/product result is not an attraction review");
});

test("the map generator uses the verified nearby drive distances", () => {
  assert.match(mapRenderer, /id: "r01"[^\n]*km: 43\.8, minutes: 70/);
  assert.match(mapRenderer, /id: "r02"[^\n]*km: 42\.5, minutes: 60/);
});
