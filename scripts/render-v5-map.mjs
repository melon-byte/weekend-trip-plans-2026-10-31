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
  { id: "02", label: "A", name: "淀山湖", location: "121.009195,31.131111", km: 57.0, minutes: 77 },
  { id: "03", label: "B", name: "朱家角", location: "121.053846,31.111260", km: 50.9, minutes: 68 },
  { id: "16", label: "C", name: "东方绿舟", location: "121.014970,31.100305", km: 53.4, minutes: 72 },
  { id: "04", label: "D", name: "金山城市沙滩", location: "121.347900,30.718416", km: 77.3, minutes: 90 },
  { id: "05", label: "E", name: "枫泾古镇", location: "121.014236,30.886131", km: 69.3, minutes: 83 },
  { id: "f01", label: "F", name: "碧海金沙", location: "121.551519,30.819573", km: 52.5, minutes: 80 },
  { id: "12", label: "G", name: "花开半夏", location: "121.532529,30.984180", km: 35.0, minutes: 58 },
  { id: "14", label: "H", name: "新场古镇", location: "121.642786,31.023532", km: 33.1, minutes: 42 },
  { id: "p01", label: "I", name: "海昌海洋公园", location: "121.905695,30.912653", km: 69.6, minutes: 76 },
  { id: "17", label: "J", name: "上海迪士尼", location: "121.667003,31.141447", km: 29.9, minutes: 43 },
  { id: "s01", label: "K", name: "锦溪古镇", location: "120.902516,31.177927", km: 67.3, minutes: 83 },
  { id: "s02", label: "L", name: "周庄古镇", location: "120.850910,31.114744", km: 87.1, minutes: 92 },
  { id: "s03", label: "M", name: "太湖西山", location: "120.255924,31.116207", km: 140.4, minutes: 134 },
  { id: "s04", label: "N", name: "太湖东山陆巷古村", location: "120.363392,31.074631", km: 131.0, minutes: 126 },
  { id: "r01", label: "O", name: "广富林文化遗址", location: "121.196269,31.062675", km: 43.8, minutes: 70 },
  { id: "r02", label: "P", name: "菊园百果园", location: "121.210974,31.370895", km: 42.5, minutes: 60 },
  { id: "s05", label: "Q", name: "天平山", location: "120.504155,31.287304", km: 120.3, minutes: 126 },
  { id: "j01", label: "R", name: "南北湖", location: "120.847395,30.372508", km: 143.6, minutes: 141 },
  { id: "06", label: "S", name: "廊下枫叶岛", location: "121.174735,30.775134", km: 89.1, minutes: 103 },
  { id: "11", label: "T", name: "青西郊野公园", location: "120.982773,31.064618", km: 67.3, minutes: 90 },
  { id: "f02", label: "U", name: "海湾国家森林公园", location: "121.690609,30.861518", km: 58.7, minutes: 70 },
  { id: "r03", label: "V", name: "佘山国家森林公园", location: "121.196565,31.094440", km: 41.6, minutes: 77 },
  { id: "r04", label: "W", name: "炮台湾湿地", location: "121.509028,31.396662", km: 24.0, minutes: 48 },
  { id: "r05", label: "X", name: "嘉北郊野公园", location: "121.196831,31.357432", km: 46.0, minutes: 63 }
];

const nearbyPlaces = [
  { id: "r01", label: "O", name: "广富林文化遗址", location: "121.196269,31.062675", km: 43.8, minutes: 70 },
  { id: "r02", label: "P", name: "菊园百果园", location: "121.210974,31.370895", km: 42.5, minutes: 60 }
];

function readAmapKey() {
  if (process.env.AMAP_MAPS_API_KEY) return process.env.AMAP_MAPS_API_KEY;
  const configPath = path.join(os.homedir(), ".codex", "config.toml");
  const config = fs.readFileSync(configPath, "utf8");
  const match = config.match(/AMAP_MAPS_API_KEY\s*=\s*"([^"]+)"/);
  if (!match) throw new Error("AMAP_MAPS_API_KEY is not configured");
  return match[1];
}

async function renderStaticMap(key, options) {
  const { center, zoom, size, output } = options;
  const url = new URL("https://restapi.amap.com/v3/staticmap");
  url.searchParams.set("key", key);
  url.searchParams.set("location", center);
  url.searchParams.set("zoom", zoom);
  url.searchParams.set("size", size);
  url.searchParams.set("scale", "1");

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Static map HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    throw new Error(`Static map did not return PNG: ${bytes.toString("utf8", 0, 240)}`);
  }
  const outputPath = path.join(publishRoot, output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, bytes);
  return {
    path: output,
    bytes: bytes.length,
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    center,
    zoom: Number(zoom),
    scale: 1,
    worldSize: 512 * (2 ** Number(zoom)),
    markersBaked: false
  };
}

async function renderStaticMapOrReuse(key, options) {
  try {
    return await renderStaticMap(key, options);
  } catch (error) {
    const outputPath = path.join(publishRoot, options.output);
    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 10000) {
      const bytes = fs.readFileSync(outputPath);
      return {
        path: options.output, bytes: bytes.length,
        width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20),
        center: options.center, zoom: Number(options.zoom), scale: 1,
        worldSize: 512 * (2 ** Number(options.zoom)), markersBaked: false,
        reused: true, refreshError: error.message
      };
    }
    throw error;
  }
}

const key = readAmapKey();
const map = await renderStaticMapOrReuse(key, {
  center: "121.08,30.90",
  zoom: "8",
  size: "1000*600",
  places,
  output: "assets/amap-route-basemap-v6.png"
});
const output = {
  fetchedAt: new Date().toISOString(),
  provider: "高德地图 POI / 距离测量 / 静态地图",
  origin,
  places,
  nearbyPlaces,
  map
};
fs.mkdirSync(researchDir, { recursive: true });
fs.writeFileSync(path.join(researchDir, "amap-v5-routes.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify(output, null, 2));
