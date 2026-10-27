import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function readAmapKey() {
  if (process.env.AMAP_MAPS_API_KEY) return process.env.AMAP_MAPS_API_KEY;

  const configPath = path.join(os.homedir(), ".codex", "config.toml");
  const config = fs.readFileSync(configPath, "utf8");
  const match = config.match(/AMAP_MAPS_API_KEY\s*=\s*"([^"]+)"/);
  if (!match) throw new Error("AMAP_MAPS_API_KEY is not configured");
  return match[1];
}

async function requestJson(url) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(url);
    const payload = await response.json();
    if (payload.status === "1") return payload;
    if (payload.infocode !== "10021") {
      throw new Error(`${payload.info || "Amap request failed"}: ${payload.infocode || ""}`);
    }
    await sleep(1200 * (attempt + 1));
  }
  throw new Error("Amap request kept hitting the rate limit");
}

const places = [
  { id: "origin", name: "陆家嘴", address: "上海陆家嘴", city: "上海" },
  { id: "01", name: "太阳岛", address: "上海太阳岛度假酒店", city: "上海" },
  { id: "02", name: "淀山湖帆船", address: "上海美帆游艇俱乐部", city: "上海" },
  { id: "02b", name: "金泽古镇", address: "金泽古镇", city: "上海" },
  { id: "03", name: "朱家角", address: "朱家角古镇", city: "上海" },
  { id: "04", name: "金山嘴渔村", address: "金山嘴渔村", city: "上海" },
  { id: "05", name: "枫泾古镇", address: "枫泾古镇", city: "上海" },
  { id: "06", name: "廊下枫叶岛", address: "廊下枫叶岛", city: "上海" },
  { id: "08", name: "滴水湖", address: "滴水湖", city: "上海" },
  { id: "09", name: "上海之鱼", address: "上海之鱼", city: "上海" },
  { id: "11", name: "青西郊野公园", address: "上海青西郊野公园", city: "上海" },
  { id: "12", name: "花开半夏", address: "花开半夏田园美墅度假村", city: "上海" },
  { id: "13", name: "青溪老街", address: "青溪老街", city: "上海" },
  { id: "14", name: "新场古镇", address: "新场古镇", city: "上海" },
  { id: "15", name: "花开海上", address: "花开海上生态园", city: "上海" },
  { id: "16", name: "东方绿舟", address: "东方绿舟", city: "上海" },
  { id: "17", name: "川沙古镇", address: "川沙古镇", city: "上海" },
  { id: "17b", name: "比斯特上海", address: "比斯特上海购物村", city: "上海" },
  { id: "s01", name: "锦溪古镇", address: "锦溪古镇", city: "苏州" },
  { id: "s02", name: "周庄古镇", address: "周庄古镇", city: "苏州" },
  { id: "s03", name: "缥缈峰", address: "缥缈峰景区", city: "苏州" }
];

const key = readAmapKey();
const geocoded = [];

for (const place of places) {
  const url = new URL("https://restapi.amap.com/v3/geocode/geo");
  url.searchParams.set("key", key);
  url.searchParams.set("address", place.address);
  url.searchParams.set("city", place.city);
  const payload = await requestJson(url);
  const result = payload.geocodes?.[0];
  if (!result?.location) throw new Error(`No geocode result for ${place.name}`);
  geocoded.push({
    ...place,
    formattedAddress: result.formatted_address,
    location: result.location,
    adcode: result.adcode
  });
  await sleep(280);
}

const origin = geocoded.find((place) => place.id === "origin");
const routes = [];

for (const destination of geocoded.filter((place) => place.id !== "origin")) {
  const url = new URL("https://restapi.amap.com/v3/direction/driving");
  url.searchParams.set("key", key);
  url.searchParams.set("origin", origin.location);
  url.searchParams.set("destination", destination.location);
  url.searchParams.set("extensions", "base");
  url.searchParams.set("strategy", "0");
  const payload = await requestJson(url);
  const route = payload.route?.paths?.[0];
  if (!route?.distance || !route?.duration) {
    throw new Error(`No driving route for ${destination.name}`);
  }
  routes.push({
    id: destination.id,
    name: destination.name,
    distanceMeters: Number(route.distance),
    durationSeconds: Number(route.duration)
  });
  await sleep(320);
}

const output = {
  fetchedAt: new Date().toISOString(),
  provider: "高德地图 Web 服务",
  origin,
  places: geocoded.filter((place) => place.id !== "origin"),
  routes
};
const outputPath = path.resolve(import.meta.dirname, "..", "research", "v4", "amap-routes.json");
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Wrote ${outputPath}`);
