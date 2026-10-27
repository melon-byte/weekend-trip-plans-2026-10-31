import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const publishRoot = path.resolve(here, "..");
const researchDir = path.resolve(publishRoot, "research", "v4");

const origin = {
  id: "origin",
  label: "S",
  name: "陆家嘴",
  location: "121.507513,31.234295"
};

const places = [
  { id: "02", label: "A", name: "淀山湖", location: "121.009195,31.131111", km: 57.1, minutes: 78 },
  { id: "03", label: "B", name: "朱家角", location: "121.053846,31.111260", km: 50.9, minutes: 70 },
  { id: "16", label: "C", name: "东方绿舟", location: "121.014970,31.100305", km: 53.4, minutes: 75 },
  { id: "04", label: "D", name: "金山城市沙滩", location: "121.347900,30.718416", km: 76.1, minutes: 90 },
  { id: "05", label: "E", name: "枫泾古镇", location: "121.014236,30.886131", km: 69.2, minutes: 95 },
  { id: "f01", label: "F", name: "碧海金沙", location: "121.551519,30.819573", km: 54.1, minutes: 84 },
  { id: "12", label: "G", name: "花开半夏", location: "121.532529,30.984180", km: 35.0, minutes: 64 },
  { id: "14", label: "H", name: "新场古镇", location: "121.642786,31.023532", km: 33.1, minutes: 53 },
  { id: "p01", label: "I", name: "海昌海洋公园", location: "121.905695,30.912653", km: 68.8, minutes: 80 },
  { id: "17", label: "J", name: "上海迪士尼", location: "121.667003,31.141447", km: 29.9, minutes: 55 },
  { id: "s01", label: "K", name: "锦溪古镇", location: "120.902516,31.177927", km: 67.3, minutes: 85 },
  { id: "s02", label: "L", name: "周庄古镇", location: "120.850910,31.114744", km: 87.1, minutes: 93 },
  { id: "s03", label: "M", name: "太湖西山", location: "120.255924,31.116207", km: 140.4, minutes: 131 },
  { id: "s04", label: "N", name: "太湖东山陆巷古村", location: "120.363392,31.074631", km: 131.0, minutes: 123 }
];

function readAmapKey() {
  if (process.env.AMAP_MAPS_API_KEY) return process.env.AMAP_MAPS_API_KEY;
  const configPath = path.join(os.homedir(), ".codex", "config.toml");
  const config = fs.readFileSync(configPath, "utf8");
  const match = config.match(/AMAP_MAPS_API_KEY\s*=\s*"([^"]+)"/);
  if (!match) throw new Error("AMAP_MAPS_API_KEY is not configured");
  return match[1];
}

async function renderStaticMap(key) {
  const markerGroups = [
    `large,0xC34A2D,S:${origin.location}`,
    `mid,0x1F6B53,:${places.map((place) => place.location).join(";")}`
  ];
  const url = new URL("https://restapi.amap.com/v3/staticmap");
  url.searchParams.set("key", key);
  url.searchParams.set("location", "121.08,31.00");
  url.searchParams.set("zoom", "8");
  url.searchParams.set("size", "1000*500");
  url.searchParams.set("markers", markerGroups.join("|"));

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Static map HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    throw new Error(`Static map did not return PNG: ${bytes.toString("utf8", 0, 240)}`);
  }
  const outputPath = path.join(publishRoot, "assets", "amap-route-map-v5.png");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, bytes);
  return { path: "assets/amap-route-map-v5.png", bytes: bytes.length };
}

const map = await renderStaticMap(readAmapKey());
const output = {
  fetchedAt: new Date().toISOString(),
  provider: "高德地图 POI / 距离测量 / 静态地图",
  origin,
  places,
  map
};
fs.mkdirSync(researchDir, { recursive: true });
fs.writeFileSync(path.join(researchDir, "amap-v5-routes.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify(output, null, 2));
