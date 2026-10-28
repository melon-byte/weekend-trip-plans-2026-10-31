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

test("Disney and ocean park routes are removed from every view", () => {
  for (const id of ["17", "p01"]) {
    assert.ok(!html.includes('id="route-' + id + '"'), `removed route ${id} remains in regions`);
    assert.ok(!html.includes('id="route-dialog-' + id + '"'), `removed route ${id} still has a dialog`);
    assert.ok(!html.includes('data-route-id="' + id + '"'), `removed route ${id} remains in the ranking or map`);
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

test("region routes and map index are ordered by driving distance, nearest first", () => {
  const regionSections = [...html.matchAll(/<section class="region-section"[\s\S]*?<\/section>/g)];
  assert.ok(regionSections.length > 0, "region sections missing");

  for (const [section] of regionSections) {
    const distances = [...section.matchAll(/<article class="route-card" id="route-[^"]+"([\s\S]*?)<\/article>/g)]
      .map(([, card]) => Number(card.match(/高德驾车 ([\d.]+) km/)?.[1]));
    assert.ok(distances.every((distance, index) => index === 0 || distances[index - 1] <= distance),
      `region routes are not distance-sorted: ${distances.join(", ")}`);
  }

  const regionDistances = [...html.matchAll(/class="region-distance">陆家嘴出发 · 主玩地平均约 ([\d.]+) km/g)]
    .map((match) => Number(match[1]));
  assert.ok(regionDistances.every((distance, index) => index === 0 || regionDistances[index - 1] <= distance),
    `regions are not ordered by distance: ${regionDistances.join(", ")}`);

  const indexStart = html.indexOf('<div class="map-route-index"');
  const indexEnd = html.indexOf('<div class="map-legend"', indexStart);
  const mapIndex = html.slice(indexStart, indexEnd);
  const distances = [...mapIndex.matchAll(/<a class="map-index-route"[^>]+>([\s\S]*?)<\/a>/g)]
    .map(([, item]) => Number(item.match(/高德驾车 ([\d.]+) km/)?.[1]));
  assert.equal(distances.length, 22, "map index should contain every remaining route");
  assert.ok(distances.every((distance, index) => index === 0 || distances[index - 1] <= distance),
    `map routes are not globally distance-sorted: ${distances.join(", ")}`);
});

test("every active route has a clickable marker over the map image", () => {
  const markers = [...html.matchAll(/<a class="map-extra-stop"[^>]*data-route-id="([^"]+)"/g)]
    .map((match) => match[1]);
  const routeCards = [...html.matchAll(/<article class="route-card" id="route-([^"]+)"/g)]
    .map((match) => match[1]);
  assert.equal(markers.length, routeCards.length, "every route needs an image marker");
  assert.equal(new Set(markers).size, markers.length, "map markers must be unique per route");
  assert.ok(routeCards.every((routeId) => markers.includes(routeId)), "a route is missing its map marker");
  assert.ok(!html.includes("data-map-leaders"), "map points must not be displaced or connected by artificial guide lines");
  assert.ok(!html.includes('src="assets/amap-route-map-v5.png"'), "old baked-in pins must not be displayed");
  assert.ok(html.includes('src="assets/amap-route-basemap-v6.png"'), "the map needs a clean local basemap");
});

test("map coordinates match the real raster scale, including both Taihu islands", () => {
  const data = JSON.parse(fs.readFileSync(path.join(here, "research", "v4", "amap-v5-routes.json"), "utf8"));
  assert.equal(data.map.markersBaked, false);
  assert.equal(data.map.worldSize, 131072);
  const coordinates = [...html.matchAll(/<a class="map-extra-stop"[\s\S]*?data-route-id="([^"]+)"[\s\S]*?data-map-x="([\d.]+)" data-map-y="([\d.]+)"/g)];
  const points = new Map(coordinates.map(([, id, x, y]) => [id, [Number(x), Number(y)]]));
  for (const [id, expected] of [["s03", [200, 208]], ["s04", [239, 226]]]) {
    assert.ok(points.has(id), `Taihu route ${id} is missing`);
    const actual = points.get(id);
    assert.ok(Math.hypot(actual[0] - expected[0], actual[1] - expected[1]) < 4,
      `Taihu point ${id} is not at its independently checked basemap location: ${actual}`);
  }
  for (const point of points.values()) {
    assert.ok(point[0] > 0 && point[0] < data.map.width && point[1] > 0 && point[1] < data.map.height,
      "all map points must be within the complete basemap");
  }
});

test("tab-panel headings and explanations are removed and the top spacing is compact", () => {
  assert.ok(!html.includes(">周末路线总榜</h2>"), "ranking heading remains visible");
  assert.ok(!html.includes("白天体验 45 · 内容组合 25 · 省心程度 20 · 证据质量 10。住宿不参与加分。"),
    "ranking score explanation remains visible");
  assert.ok(!html.includes(">按区域看路线</p>"), "region navigation heading remains visible");
  assert.ok(!html.includes("高德真实底图 · 陆家嘴出发") && !html.includes("先看位置，再选路线"),
    "map heading remains visible");
  assert.ok(!html.includes("底图和点位来自高德 POI/静态地图；各区按陆家嘴至主游玩地的平均驾车公里数由远到近排列，出发时以实时导航为准。"),
    "map explanation remains visible");
  assert.ok(builder.includes("padding: 12px 0 8px"), "page title spacing was not compacted");
});
