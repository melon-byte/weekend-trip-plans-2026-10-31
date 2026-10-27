import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const publishRoot = path.resolve(here, "..");

const targets = [
  {
    output: "assets/routes/route-f01.jpg",
    url: "https://www.amap.com/detail/B00155IOQD",
    imageUrl: "http://store.is.autonavi.com/showpic/04acfb003ec74cdba0fde514943a643e"
  },
  {
    output: "assets/routes/route-p01.jpg",
    url: "https://www.amap.com/detail/B0FFG954E8",
    imageUrl: "http://store.is.autonavi.com/showpic/b50e67b60f78cdddfe26360f0be56f78"
  },
  {
    output: "assets/routes/route-c01.jpg",
    url: "https://www.amap.com/detail/B001529DBC",
    imageUrl: "http://store.is.autonavi.com/showpic/fd4e4355716ec75087326b01456c0f0d"
  },
  {
    output: "assets/routes/route-17-disney.jpg",
    url: "https://www.amap.com/detail/B00157AW8O",
    imageUrl: "http://store.is.autonavi.com/showpic/4f83bd890aba5ab4f0d859e5e25a94f7"
  },
  {
    output: "assets/routes/route-s04.jpg",
    url: "https://www.amap.com/detail/B02000IFHH",
    imageUrl: "http://store.is.autonavi.com/showpic/a7a2a6a0608be8e52a36049b88c752aa"
  },
  {
    output: "assets/stays/stay-liuxia.jpg",
    url: "https://hotels.ctrip.com/hotels/66663276.html"
  },
  {
    output: "assets/stays/stay-shaoguang.jpg",
    url: "https://hotels.ctrip.com/hotels/91987537.html"
  },
  {
    output: "assets/stays/stay-qingfeng.jpg",
    url: "https://hotels.ctrip.com/hotels/119970897.html"
  },
  {
    output: "assets/stays/stay-duoyun.jpg",
    url: "https://hotels.ctrip.com/hotels/88808860.html"
  },
  {
    output: "assets/stays/stay-zhuji.jpg",
    url: "https://hotels.ctrip.com/hotels/18435041.html"
  },
  {
    output: "assets/stays/stay-shiguangli.jpg",
    url: "https://hotels.ctrip.com/hotels/76147352.html"
  },
  {
    output: "assets/stays/stay-chaoba.jpg",
    url: "https://m.ctrip.com/html5/hotel/hoteldetail/75868578.html",
    imageUrl: "http://p1.meituan.net/400.0/tdchoteldark/963f2aea057ea4a7fd2daf93ff0e7a433824251.jpg"
  },
  {
    output: "assets/stays/stay-sanjo.jpg",
    url: "https://hotels.ctrip.com/hotels/126313505.html"
  },
  {
    output: "assets/stays/stay-shuyun.jpg",
    url: "https://hotels.ctrip.com/hotels/6007008.html"
  }
];

function decodeHtml(text) {
  return text
    .replace(/\\\//g, "/")
    .replace(/\\u002F/gi, "/")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"");
}

function findImageUrl(html) {
  const decoded = decodeHtml(html);
  const candidates = decoded.match(/https?:\/\/[^\s"'<>]+?\.(?:jpg|jpeg|png)(?:\?[^\s"'<>]*)?/gi) || [];
  const normalized = candidates
    .filter((url) => /(?:dimg\d+\.c-ctrip\.com|images\.c-ctrip\.com|youimg1\.c-ctrip\.com)/i.test(url))
    .map((url) => url.replace(/_D_\d+_\d+(?=\.(?:jpg|jpeg|png))/i, "_W_1280_853_R5_Q70"));
  return normalized.find((url) => url.includes("_W_1280_853")) || normalized[0] || "";
}

async function fetchTarget(target) {
  const outputPath = path.join(publishRoot, target.output);
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 10000) {
    return { output: target.output, reused: true };
  }

  if (target.imageUrl) {
    const directResponse = await fetch(target.imageUrl, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
        referer: target.url
      }
    });
    if (!directResponse.ok) throw new Error(`${target.output}: direct image HTTP ${directResponse.status}`);
    const directBytes = Buffer.from(await directResponse.arrayBuffer());
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, directBytes);
    return { output: target.output, imageUrl: target.imageUrl, bytes: directBytes.length };
  }

  const response = await fetch(target.url, {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
      "accept-language": "zh-CN,zh;q=0.9"
    }
  });
  if (!response.ok) throw new Error(`${target.output}: page HTTP ${response.status}`);
  const imageUrl = findImageUrl(await response.text());
  if (!imageUrl) throw new Error(`${target.output}: no Ctrip image found`);

  const imageResponse = await fetch(imageUrl, {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
      referer: target.url
    }
  });
  if (!imageResponse.ok) throw new Error(`${target.output}: image HTTP ${imageResponse.status}`);
  const bytes = Buffer.from(await imageResponse.arrayBuffer());
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
  const isPng = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (!isJpeg && !isPng) throw new Error(`${target.output}: downloaded bytes are not an image`);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, bytes);
  return { output: target.output, imageUrl, bytes: bytes.length };
}

const results = [];
for (const target of targets) {
  results.push(await fetchTarget(target));
}

console.log(JSON.stringify(results, null, 2));
