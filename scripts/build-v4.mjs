import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const publishRoot = path.resolve(here, "..");
const baselinePath = path.resolve(publishRoot, "..", "trip-data.json");
const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const outputPath = path.join(publishRoot, "weekend-trip-plans-2026-10-31-v4.html");

const routeReviews = {
  "01": "项目多、环境好，但不少另收费且关得早；先电话确认再排。",
  "02": "湖面开阔、古镇安静；没约上船就别专程追码头。",
  "03": "经典水乡、夜景最值；游船和园林挑两项就够。",
  "04": "老街免费、海鲜氛围强；展馆挑一两个就够，先确认开放。",
  "05": "人少、烟火气足，长廊雨天也好走；一船正好 6 人。",
  "06": "10 月底红枫偏早，晴天来拍黄绿秋色；山塘顺路逛就好。",
  "08": "湖面开阔，周六 20:00 有烟花；水上项目要预约，雨天转航海馆。",
  "09": "湖景和草坪适合慢逛，博物馆免费又有乾隆特展；雨天更稳。",
  "11": "水上森林最出片，上午直奔短线；16点后停止进入。",
  "12": "手作、庭院和晚间活动都在同一处，适合不想暴走的一天。",
  "13": "老街安静、夜景加分；望海楼和摇橹船顺路挑一个就够。",
  "14": "冷门古镇、小吃和茶馆都扎实；白天真正有东西吃逛。",
  "15": "地肤和花海很开阔，10 月底属转色期；晴天更值。",
  "16": "航母和兵器馆是真亮点；园区大，另收费项目先问。",
  "17": "老街免费、比斯特适合第二天吃饭逛；顺路感很强。"
};

const routeMeta = {
  "01": {
    group: "qingpu",
    fee: "温泉 10 月 31 日大概率未开，先电话确认；保龄球、垂钓等另收费。",
    travel: "陆家嘴驾车 59.8 km · 约 86 分钟"
  },
  "02": {
    group: "qingpu",
    fee: "帆船要预约，6 人票价和天气退改先问；金泽免大门票，游船现场问价。",
    travel: "淀山湖 57.4 km · 约 85 分钟；金泽 64.8 km · 约 80 分钟"
  },
  "03": {
    group: "qingpu",
    fee: "古镇免费；3 景点联票约 45–55 元；游船 200–300 元/船，最多 6 人。",
    travel: "陆家嘴驾车 51.0 km · 约 73 分钟"
  },
  "11": {
    group: "qingpu",
    fee: "公园免费；电瓶车 20 元/人；水上森林 16:00 停止进入，游船收费先问。",
    travel: "陆家嘴驾车 60.0 km · 约 83 分钟"
  },
  "16": {
    group: "qingpu",
    fee: "门票 45 元起，观光车 40 元/人；园内项目另收费，最晚 16:00 入园。",
    travel: "陆家嘴驾车 52.7 km · 约 77 分钟"
  },
  "04": {
    group: "jinshan",
    fee: "老街免费；展馆联票约 40 元、单馆 10 元；海边步道免费，停车现场确认。",
    travel: "陆家嘴驾车 82.9 km · 约 94 分钟"
  },
  "05": {
    group: "jinshan",
    fee: "古镇免费；场馆通票约 42 元；手摇船约 40 分钟，票价现场问。",
    travel: "陆家嘴驾车 73.8 km · 约 93 分钟"
  },
  "06": {
    group: "jinshan",
    fee: "枫叶岛免费，停车免费但车位少；划船收费先问；廊华路部分施工。",
    travel: "陆家嘴驾车 89.0 km · 约 101 分钟"
  },
  "15": {
    group: "jinshan",
    fee: "门票 30 元、实名入园；停车免费；观光车和多人车收费先问。",
    travel: "陆家嘴驾车 73.9 km · 约 101 分钟"
  },
  "09": {
    group: "fengxian",
    fee: "上海之鱼免费；科幻馆 128 元起可选；奉贤博物馆免费，乾隆特展 11/18 撤展。",
    travel: "陆家嘴驾车 40.6 km · 约 70 分钟"
  },
  "12": {
    group: "fengxian",
    fee: "园区无门票；烧烤 500 元/次；成人手作和烘焙需先问场次与收费。",
    travel: "陆家嘴驾车 35.1 km · 约 57 分钟"
  },
  "13": {
    group: "fengxian",
    fee: "老街免费；摇橹船价格现场问；望海楼登楼或品茗需提前预约。",
    travel: "陆家嘴驾车 38.9 km · 约 61 分钟"
  },
  "08": {
    group: "pudong",
    fee: "滴水湖免费；游船成人 100 元；航海馆 30 元、AR 另加 99 元；水上项目预约后问价。",
    travel: "陆家嘴驾车约 69–71 km · 80–85 分钟"
  },
  "14": {
    group: "pudong",
    fee: "古镇免费；内部小馆单独购票；摇橹船先问价；剧本餐秀 138 元/人可选。",
    travel: "陆家嘴驾车 34.8 km · 约 55 分钟"
  },
  "17": {
    group: "pudong",
    fee: "老街免费；轮渡 15 元/人；比斯特消费满 50 元可兑 5 小时免费停车。",
    travel: "川沙 28.6 km · 约 50 分钟；比斯特 30.3 km · 约 48 分钟"
  }
};

const groups = [
  {
    id: "qingpu",
    eyebrow: "水乡 · 湖岸 · 森林",
    title: "青浦",
    intro: "水乡最集中，晴天看湖和森林，雨天也能换到园林与室内。"
  },
  {
    id: "jinshan",
    eyebrow: "海边 · 古镇 · 花田",
    title: "金山",
    intro: "想吃海鲜、看海、拍秋景，从这里选一条。"
  },
  {
    id: "fengxian",
    eyebrow: "湖景 · 手作 · 夜景",
    title: "奉贤",
    intro: "路线更松，适合博物馆兜底、做手作或晚上看灯。"
  },
  {
    id: "pudong",
    eyebrow: "滴水湖 · 古镇 · 商圈",
    title: "浦东",
    intro: "从陆家嘴出发更近，水上体验和新场逛吃最稳。"
  },
  {
    id: "suzhou",
    eyebrow: "锦溪 · 周庄 · 太湖西山",
    title: "苏州跨城",
    intro: "这三条车程更长，适合整趟只为一条路线去；住宿只是晚上落脚。"
  }
];

const nearbyStayByRoute = {
  "01": "太阳岛 · 俱乐部别墅三房一厅",
  "06": "上海涵七民宿",
  "08": "拾光 / 三顾茅庐 / 书院人家",
  "11": "上海浮生民宿",
  "12": "花开半夏·田园美墅度假村",
  "13": "花筑·到家民宿",
  "14": "上海浓舍民宿",
  "15": "归源田居",
  "16": "朱家角皇家郁金香花园酒店",
  "17": "上海闲舍独栋别墅",
  s01: "橙屿民宿",
  s02: "觅家·一夜花香",
  s03: "太湖西山小白房"
};

const stayMeta = {
  shiguang: {
    group: "pudong",
    review: "村里安静，KTV、棋牌和花园适合晚上自娱；白天去湖边还要开车。",
    confirm: "现有资料只有 3 间房；要满足 4 房，必须另问加房或换房型。",
    fit: "资料仅 3 间，不匹配"
  },
  sun: {
    group: "qingpu",
    review: "玩乐项目集中在岛内，晚上省得再开车；温泉先确认是否开池。",
    confirm: "俱乐部别墅资料是 3 卧；要住 4 房需另问房型组合。",
    fit: "资料仅 3 卧，不匹配"
  },
  hanqi: {
    group: "jinshan",
    review: "就在枫叶岛内，白天看叶色，晚上回独栋烧烤唱歌；4 室包栋正合适。",
    confirm: "确认 4 室床型、10 月底房态、烧烤区和宠物清洁规则。",
    fit: "有 4 室包栋候选"
  },
  sangu: {
    group: "pudong",
    review: "去年新装修，影音和 KTV 齐全；离滴水湖岸边约 4 公里。",
    confirm: "整栋共 5 间客房，能否只开 4 房及计费方式必须问。",
    fit: "5 间，4 房使用待确认"
  },
  new_fusheng: {
    group: "qingpu",
    review: "稻田和乡村环境安静，离青西公园近；晚上适合少跑。",
    confirm: "现有资料偏 3 房；必须确认能否凑足 4 卧并单独使用公区。",
    fit: "资料仅 3 房，待确认"
  },
  banxia: {
    group: "fengxian",
    review: "庭院 LOFT 看星星，手作、土灶、KTV 和草坪活动都集中在园内。",
    confirm: "6 人 4 间的组合、成人手作场次、烧烤 500 元/次含什么，都要问。",
    fit: "可拼 4 间，组合待确认"
  },
  new_daojia: {
    group: "fengxian",
    review: "就住在老街里，出门就是夜景和小吃；KTV、棋牌室齐全。",
    confirm: "7 间房里如何挑 4 间、KTV 晚间时段、烧烤和停车先问。",
    fit: "7 间可选 4 间，待确认"
  },
  new_nongshe: {
    group: "pudong",
    review: "就在新场古镇大街，晚上逛完直接走回去，整栋住 6 人刚好。",
    confirm: "整栋只有 3 间卧室，满足不了 4 房需求；只能按 3 房 6 人方案考虑。",
    fit: "仅 3 卧，不适合 4 房"
  },
  new_guiyuan: {
    group: "jinshan",
    review: "草坪庭院适合拍照和慢住，离花开海上玩法近。",
    confirm: "现有资料偏 3 房；4 房满足方式、做饭规则和公区收费先问。",
    fit: "资料仅 3 房，待确认"
  },
  new_shuyuan: {
    group: "pudong",
    review: "江南园林环境舒服，房间安静，适合临港落脚。",
    confirm: "一次订4间、相邻房和早餐份数先问。",
    fit: "可订4间，先问相邻"
  },
  new_xianshe: {
    group: "pudong",
    review: "带泳池、KTV 和烧烤的独栋，晚上不出门也能玩到散场。",
    confirm: "整栋房数与 4 房需求的匹配、烧烤和 KTV 是否另收费先问。",
    fit: "整栋，4 房匹配待确认"
  }
};

const newRoutes = [
  {
    id: "s01",
    group: "suzhou",
    area: "昆山 · 锦溪 / 计家墩",
    title: "锦溪古镇 · 水乡慢逛＋计家墩理想村",
    blurb: "白天看古桥、河巷和园内景点，傍晚回计家墩村里散步、烧烤聊天。",
    review: "古镇适合慢走，村里的院子适合6个人不赶时间地待着。",
    tags: ["水乡", "院子烧烤", "慢住"],
    fee: "锦溪园内套票约40元，游船约180元/船、最多6人；手作、皮划艇和烧烤另问价。",
    travel: "陆家嘴驾车约 69.8 km · 91 min，以实时导航为准",
    photo: "assets/stays/chengyu-card.jpg",
    photoAlt: "橙屿民宿庭院石板路与草坪",
    photoCaption: "橙屿民宿院子｜这条路线晚上就在这里落脚",
    activities: ["锦溪古镇古桥与河巷", "计家墩理想村散步", "院内烧烤聊天"],
    day1: [
      ["08:30–10:50", "陆家嘴出发，按实时导航去锦溪"],
      ["11:00–12:00", "锦溪古镇小吃与午饭"],
      ["12:00–15:30", "古桥河巷＋园内套票景点或游船，二选一"],
      ["16:30", "到橙屿民宿办入住，先确认4卧开放范围"],
      ["18:00以后", "计家墩晚饭、院子烧烤或桌游"]
    ],
    day2: [
      ["08:30–09:30", "民宿早餐"],
      ["09:30–10:45", "计家墩河边和小店短走"],
      ["11:00–11:30", "退房"],
      ["12:00–13:00", "午饭后返沪"]
    ],
    source: "Ctrip Wendao 名称+地址命中；美团仅村庄级近似；高德用计家墩理想村锚点"
  },
  {
    id: "s02",
    group: "suzhou",
    area: "昆山 · 周庄古镇",
    title: "周庄古镇 · 白天水巷＋晚上看灯",
    blurb: "把车停好后再进古镇，白天双桥、张厅沈厅慢慢逛，晚上只走一小圈看夜景。",
    review: "夜景是重点，住古镇里能省掉晚上来回折腾。",
    tags: ["水乡夜景", "摇橹船", "古镇住一晚"],
    fee: "周庄古镇成人票约72元；摇橹船约220元/船、最多6人；停车和行李接送先问房东。",
    travel: "陆家嘴驾车约 79.5 km · 106 min，以实时导航为准",
    photo: "assets/stays/miyi-card.jpg",
    photoAlt: "觅家·一夜花香白色小楼与院子",
    photoCaption: "觅家·一夜花香｜携程截图登记，线上三源待房东复核",
    activities: ["双桥与张厅沈厅", "水巷摇橹船", "古镇夜游"],
    day1: [
      ["08:30–10:20", "陆家嘴出发，尽量早到停车"],
      ["10:30–16:00", "古镇白天慢逛＋午饭，双桥和张厅沈厅分开走"],
      ["16:30", "到觅家办理入住，先确认4卧开放范围"],
      ["17:30–20:30", "晚饭、古镇夜游；摇橹船只坐一小段"]
    ],
    day2: [
      ["07:30–08:30", "清晨人少先走一圈，周边吃早餐"],
      ["09:00–10:30", "古镇短逛或回院子休息"],
      ["11:00–11:30", "退房"],
      ["12:00–13:00", "午饭后返沪"]
    ],
    source: "携程问道/美团/高德均未同名命中；以用户携程截图登记，近名 Leafer 已排除"
  },
  {
    id: "s03",
    group: "suzhou",
    area: "苏州 · 太湖西山",
    title: "太湖西山 · 雕花楼＋缥缈峰＋院子",
    blurb: "只选西山这一条，白天看雕花楼和湖景，傍晚回小白房做饭、聊天。",
    review: "景点和湖景才是主角；车程最长，适合整趟只为西山来。",
    tags: ["太湖", "古村古建", "泳池院子"],
    fee: "缥缈峰门票含景区交通约65元；雕花楼票价以官方渠道为准；泳池、烧烤、麻将开放与收费先问房东。",
    travel: "陆家嘴驾车约 141.6 km · 145 min，尽量早出",
    photo: "assets/stays/xibaifang-hero.jpg",
    photoAlt: "小白房建筑正面，门楣招牌可见",
    photoCaption: "太湖西山小白房｜4房整栋，晚上落脚",
    activities: ["西山雕花楼", "缥缈峰与湖景", "院子晚饭与泳池"],
    day1: [
      ["07:30–09:55", "陆家嘴出发，按导航走太湖大桥"],
      ["10:00–11:30", "西山雕花楼"],
      ["12:00–13:00", "金庭镇午饭"],
      ["13:30–16:30", "缥缈峰和湖景短线，量力而行"],
      ["17:00", "到小白房入住，确认4房和泳池开放"],
      ["18:00以后", "院子晚饭、麻将或聊天"]
    ],
    day2: [
      ["08:30–09:30", "民宿周边吃早餐"],
      ["09:30–10:45", "明月湾或湖边短走，二选一"],
      ["11:00–11:30", "退房"],
      ["12:00–13:00", "午饭后返沪，预留堵车时间"]
    ],
    source: "美团主体精确命中；携程问道为 probable 且床型口径不同；高德用西山雕花楼锚点"
  }
];

const newStays = [
  {
    id: "chengyu",
    name: "橙屿民宿（锦溪·计家墩）",
    group: "suzhou",
    rating: "5.0",
    ratingLabel: "携程 3条评价",
    review: "院子安静，适合6个人烧烤、聊天、慢住。",
    confirm: "5房整套只开4卧的范围与计费、早餐份数、烧烤和停车必须问。",
    fit: "5房，只开4卧待确认",
    photo: "assets/stays/chengyu-card.jpg",
    photoAlt: "橙屿民宿庭院",
    source: "https://www.ctrip.com/",
    sourceLabel: "携程问道名称+地址命中"
  },
  {
    id: "miyi",
    name: "觅家·一夜花香（周庄）",
    group: "suzhou",
    rating: "5.0",
    ratingLabel: "携程截图 8条评价",
    review: "晚上逛完古镇直接回独栋，位置省心。",
    confirm: "线上三源未同名命中；预订前复核在售、4卧使用、停车和行李接送。",
    fit: "5房，只开4卧待确认",
    photo: "assets/stays/miyi-card.jpg",
    photoAlt: "觅家·一夜花香白色小楼和院子",
    source: "https://www.ctrip.com/",
    sourceLabel: "用户携程截图登记，待复核"
  },
  {
    id: "xishan",
    name: "太湖西山 · 小白房",
    group: "suzhou",
    rating: "5.0 / 4.4",
    ratingLabel: "携程 11条 / 美团",
    review: "4房刚好，泳池和院子适合6个人聚会。",
    confirm: "详细门牌、4房开放、泳池是否开放及收费、厨房烧烤规则先问；床型两平台口径不同。",
    fit: "4房，人数匹配",
    photo: "assets/stays/xibaifang-hero.jpg",
    photoAlt: "小白房建筑与门楣招牌",
    source: "http://dpurl.cn/my0XrrHz",
    sourceLabel: "美团主体精确命中"
  }
];

const groupLookup = new Map(groups.map((group) => [group.id, group]));

function isUsableImageAsset(relativePath) {
  const assetPath = path.join(publishRoot, relativePath);
  if (!fs.existsSync(assetPath)) return false;
  const bytes = fs.readFileSync(assetPath).subarray(0, 12);
  return (
    (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ||
    bytes.subarray(0, 4).toString("ascii") === "RIFF"
  );
}

const oldRoutes = baseline.routes.map((route) => {
  const meta = routeMeta[route.n];
  const photos = baseline.reviewData[route.n].photos;
  const photo = photos[0];
  const ext1 = /\.png(?:$|\?)/i.test(photo.src) ? "png" : "jpg";
  const secondaryPhoto = photos.slice(1).map((photoCandidate, index) => {
    const ext = /\.png(?:$|\?)/i.test(photoCandidate.src) ? "png" : "jpg";
    return {
      ...photoCandidate,
      assetPath: `assets/routes/route-${route.n}-2.${ext}`,
      ext,
      index
    };
  }).find((photoCandidate) => isUsableImageAsset(photoCandidate.assetPath));
  const firstSource = route.sources?.[0]?.[2] || "";
  return {
    id: route.n,
    group: meta.group,
    area: route.area,
    title: route.title,
    blurb: baseline.routeBriefs[route.n].why,
    review: routeReviews[route.n],
    tags: baseline.listTags[route.n] || [],
    fee: meta.fee,
    travel: meta.travel,
    photo: `assets/routes/route-${route.n}.${ext1}`,
    photoAlt: photo.caption,
    photoCaption: `${photo.caption}｜来源：携程公开景点相册`,
    photo2: secondaryPhoto?.assetPath || "",
    photo2Alt: secondaryPhoto?.caption || "",
    photo2Caption: secondaryPhoto?.caption || "",
    activities: route.play.primary,
    day1: route.sat.map((row) => [row[0], row[1]]),
    day2: route.sun.map((row) => [row[0], row[1]]),
    source: firstSource,
    nearbyStay: nearbyStayByRoute[route.n] || ""
  };
});

const oldStays = baseline.villaCandidates.map((stay) => {
  const meta = stayMeta[stay.key];
  return {
    id: stay.key,
    name: stay.name,
    group: meta.group,
    rating: stay.score,
    ratingLabel: `${stay.count}条评价`,
    review: meta.review,
    confirm: meta.confirm,
    fit: meta.fit,
    photo: `assets/stays/stay-${stay.key}.jpg`,
    photoAlt: stay.photos[0].caption,
    source: stay.source,
    sourceLabel: "携程房源页"
  };
});

const allRoutes = [...oldRoutes, ...newRoutes];
const allStays = [...oldStays, ...newStays];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[character]));
}

function renderTags(tags) {
  return tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
}

function renderTimeline(rows) {
  return rows.map(([time, text]) => `
    <li>
      <time>${escapeHtml(time)}</time>
      <span>${escapeHtml(text)}</span>
    </li>`).join("");
}

function renderRoute(route) {
  const areaParts = route.area.split(" · ");
  const regionLabel = areaParts.length > 1 ? areaParts.slice(0, -1).join(" · ") : route.area;
  const secondaryPhoto = route.photo2 ? `
    <figure class="detail-photo">
      <img src="${escapeHtml(route.photo2)}" alt="${escapeHtml(route.photo2Alt)}" loading="lazy">
      <figcaption>${escapeHtml(route.photo2Caption)}</figcaption>
    </figure>` : "";
  const source = route.source ? `
    <a class="source-link" href="${escapeHtml(route.source)}" target="_blank" rel="noreferrer">
      查看出行来源 <span aria-hidden="true">↗</span>
    </a>` : "";
  const stayLine = route.nearbyStay ? `
    <p class="evening-stop"><strong>晚上落脚</strong>${escapeHtml(route.nearbyStay)}</p>` : "";

  return `
    <article class="route-card" id="route-${escapeHtml(route.id)}">
      <details>
        <summary>
          <div class="route-photo">
            <img src="${escapeHtml(route.photo)}" alt="${escapeHtml(route.photoAlt)}" loading="lazy">
            <span class="region-pill">${escapeHtml(regionLabel)}</span>
          </div>
          <div class="route-summary">
            <div class="route-kicker">
              <span>周六去 · 周日回</span>
              <span>${escapeHtml(route.travel)}</span>
            </div>
            <h3>${escapeHtml(route.title)}</h3>
            <p class="route-blurb">${escapeHtml(route.blurb)}</p>
            <div class="route-tags">${renderTags(route.tags)}</div>
            <p class="review-line"><strong>一句话口碑</strong>${escapeHtml(route.review)}</p>
            <p class="fee-line"><strong>费用提醒</strong>${escapeHtml(route.fee)}</p>
            <span class="open-label">查看两天怎么玩 <span class="chevron" aria-hidden="true">⌄</span></span>
          </div>
        </summary>
        <div class="route-detail">
          <div class="activity-line">
            ${route.activities.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
          </div>
          <div class="days-grid">
            <section>
              <h4>周六 · 10月31日</h4>
              <ol class="timeline">${renderTimeline(route.day1)}</ol>
            </section>
            <section>
              <h4>周日 · 11月1日</h4>
              <ol class="timeline">${renderTimeline(route.day2)}</ol>
            </section>
          </div>
          ${secondaryPhoto}
          ${stayLine}
          <div class="detail-footer">
            <p>${escapeHtml(route.photoCaption)}</p>
            ${source}
          </div>
        </div>
      </details>
    </article>`;
}

function renderStay(stay) {
  return `
    <article class="stay-card">
      <img src="${escapeHtml(stay.photo)}" alt="${escapeHtml(stay.photoAlt)}" loading="lazy">
      <div class="stay-body">
        <div class="stay-heading">
          <h4>${escapeHtml(stay.name)}</h4>
          <span class="stay-score">${escapeHtml(stay.rating)}</span>
        </div>
        <p class="stay-rating">${escapeHtml(stay.ratingLabel)}</p>
        <p class="stay-review"><strong>一句话口碑</strong>${escapeHtml(stay.review)}</p>
        <p class="stay-fit">4间房适配：${escapeHtml(stay.fit)}</p>
        <p class="stay-confirm"><strong>订前先问</strong>${escapeHtml(stay.confirm)}</p>
        <a class="stay-source" href="${escapeHtml(stay.source)}" target="_blank" rel="noreferrer">${escapeHtml(stay.sourceLabel)} ↗</a>
      </div>
    </article>`;
}

const routeSections = groups.map((group) => {
  const routes = allRoutes.filter((route) => route.group === group.id);
  return `
    <section class="region-section" id="region-${group.id}" aria-labelledby="region-title-${group.id}">
      <header class="region-heading">
        <div>
          <p>${escapeHtml(group.eyebrow)}</p>
          <h2 id="region-title-${group.id}">${escapeHtml(group.title)} <span>${routes.length} 条</span></h2>
        </div>
        <p class="region-intro">${escapeHtml(group.intro)}</p>
      </header>
      <div class="route-grid">
        ${routes.map(renderRoute).join("")}
      </div>
    </section>`;
}).join("");

const staySections = groups.map((group) => {
  const stays = allStays.filter((stay) => stay.group === group.id);
  if (!stays.length) return "";
  return `
    <section class="stay-group" aria-labelledby="stay-title-${group.id}">
      <div class="stay-group-heading">
        <h3 id="stay-title-${group.id}">${escapeHtml(group.title)}</h3>
        <span>${stays.length} 处</span>
      </div>
      <div class="stay-grid">${stays.map(renderStay).join("")}</div>
    </section>`;
}).join("");

const regionLinks = groups.map((group, index) => `
  <a href="#region-${group.id}" ${index === 0 ? "aria-current=\"true\"" : ""}>${escapeHtml(group.title)}</a>`).join("") + `
  <a href="#stays">住宿候选</a>`;

const stayCount = allStays.length;
const routeCount = allRoutes.length;

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="description" content="6位成人、4间房的周末玩法攻略。先选去哪玩，再看晚上住哪。">
  <meta name="theme-color" content="#f6f2e9">
  <title>周末去哪玩 · 10月31日两天一夜</title>
  <style>
    :root {
      --ink: #202d27;
      --muted: #5f6e66;
      --paper: #f6f2e9;
      --surface: #fffdf8;
      --surface-strong: #ffffff;
      --line: #d8d4c9;
      --green: #315f49;
      --green-soft: #e7efe9;
      --rust: #a44f32;
      --rust-soft: #f5e7df;
      --blue: #2e6871;
      --blue-soft: #e4eef0;
      --gold: #9a651c;
      --gold-soft: #f8edda;
      --shadow: 0 10px 28px rgba(35, 45, 39, .08);
      --radius: 8px;
    }

    * { box-sizing: border-box; }

    html {
      scroll-behavior: smooth;
      -webkit-text-size-adjust: 100%;
      scroll-padding-top: 132px;
    }

    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif;
      font-size: 19px;
      line-height: 1.75;
    }

    a { color: var(--green); text-underline-offset: 3px; }
    img { display: block; max-width: 100%; }
    p, h1, h2, h3, h4, figure, ol { margin: 0; }
    h1, h2, h3, h4 { line-height: 1.25; letter-spacing: 0; }

    .skip-link {
      position: fixed;
      top: 8px;
      left: 8px;
      z-index: 100;
      padding: 12px 16px;
      background: var(--ink);
      color: white;
      transform: translateY(-150%);
    }

    .skip-link:focus { transform: translateY(0); }

    .topbar {
      position: sticky;
      top: 0;
      z-index: 50;
      border-bottom: 1px solid var(--line);
      background: rgba(246, 242, 233, .96);
      backdrop-filter: blur(14px);
    }

    .topbar-inner {
      width: min(1180px, calc(100% - 28px));
      margin: 0 auto;
      padding: 10px 0 9px;
    }

    .trip-facts {
      display: flex;
      align-items: baseline;
      gap: 10px;
      min-height: 36px;
    }

    .trip-facts strong { font-size: 20px; }
    .trip-facts span { color: var(--muted); font-size: 17px; }

    .region-nav {
      display: flex;
      gap: 8px;
      margin-top: 7px;
      padding-bottom: 2px;
      overflow-x: auto;
      overscroll-behavior-inline: contain;
      scrollbar-width: none;
    }

    .region-nav::-webkit-scrollbar { display: none; }

    .region-nav a {
      flex: 0 0 auto;
      min-height: 46px;
      padding: 9px 16px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: var(--surface);
      color: var(--ink);
      font-size: 17px;
      font-weight: 700;
      line-height: 26px;
      text-decoration: none;
    }

    .region-nav a[aria-current="true"] {
      border-color: var(--green);
      background: var(--green);
      color: white;
    }

    main { overflow: clip; }

    .intro {
      width: min(1180px, calc(100% - 28px));
      margin: 0 auto;
      padding: 46px 0 32px;
    }

    .intro-label {
      display: inline-flex;
      align-items: center;
      min-height: 40px;
      padding: 5px 13px;
      border: 1px solid #c7bca5;
      border-radius: 999px;
      background: var(--gold-soft);
      color: #74501d;
      font-size: 16px;
      font-weight: 800;
    }

    .intro h1 {
      max-width: 900px;
      margin-top: 18px;
      font-size: 42px;
      font-weight: 900;
    }

    .intro-lead {
      max-width: 850px;
      margin-top: 16px;
      color: #44534b;
      font-size: 21px;
      line-height: 1.65;
    }

    .intro-lead strong { color: var(--ink); }

    .overview {
      width: min(1180px, calc(100% - 28px));
      margin: 0 auto 50px;
      padding: 22px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--surface);
      box-shadow: var(--shadow);
    }

    .overview h2 { font-size: 26px; }
    .overview p { margin-top: 7px; color: var(--muted); font-size: 18px; }

    .overview-choices {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
      margin-top: 18px;
    }

    .overview-choices a {
      display: block;
      min-height: 68px;
      padding: 12px 15px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: #faf8f2;
      color: var(--ink);
      text-decoration: none;
    }

    .overview-choices strong { display: block; font-size: 20px; }
    .overview-choices span { display: block; margin-top: 1px; color: var(--muted); font-size: 16px; }

    .region-section {
      padding: 46px max(14px, calc((100% - 1180px) / 2)) 58px;
      border-top: 1px solid var(--line);
    }

    .region-section:nth-of-type(even) { background: rgba(255, 253, 248, .52); }

    .region-heading {
      display: grid;
      gap: 10px;
      margin-bottom: 24px;
    }

    .region-heading > div > p {
      color: var(--rust);
      font-size: 16px;
      font-weight: 800;
    }

    .region-heading h2 {
      margin-top: 4px;
      font-size: 38px;
      font-weight: 900;
    }

    .region-heading h2 span {
      color: var(--muted);
      font-size: 18px;
      font-weight: 700;
    }

    .region-intro {
      max-width: 760px;
      color: var(--muted);
      font-size: 18px;
      line-height: 1.65;
    }

    .route-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 22px;
    }

    .route-card {
      min-width: 0;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--surface-strong);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .route-card details { height: 100%; }

    .route-card summary {
      display: block;
      min-height: 50px;
      cursor: pointer;
      list-style: none;
      touch-action: manipulation;
    }

    .route-card summary::-webkit-details-marker { display: none; }

    .route-photo {
      position: relative;
      aspect-ratio: 16 / 9;
      overflow: hidden;
      background: #d8ddd8;
    }

    .route-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform .3s ease;
    }

    .route-card summary:hover .route-photo img { transform: scale(1.025); }

    .region-pill {
      position: absolute;
      left: 12px;
      bottom: 12px;
      max-width: calc(100% - 24px);
      padding: 6px 11px;
      border-radius: 999px;
      background: rgba(24, 38, 31, .88);
      color: white;
      font-size: 16px;
      font-weight: 800;
      line-height: 1.35;
    }

    .route-summary {
      padding: 20px 17px 18px;
    }

    .route-kicker {
      display: flex;
      flex-wrap: wrap;
      gap: 7px 13px;
      color: var(--muted);
      font-size: 15px;
      font-weight: 700;
    }

    .route-kicker span:last-child { color: var(--blue); }

    .route-summary h3 {
      margin-top: 10px;
      font-size: 30px;
      font-weight: 900;
    }

    .route-blurb {
      margin-top: 10px;
      color: #38473f;
      font-size: 19px;
      line-height: 1.65;
    }

    .route-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin-top: 13px;
    }

    .route-tags span {
      padding: 4px 9px;
      border-radius: 999px;
      background: var(--green-soft);
      color: var(--green);
      font-size: 15px;
      font-weight: 800;
    }

    .review-line,
    .fee-line {
      margin-top: 14px;
      padding-left: 13px;
      border-left: 4px solid var(--green);
      font-size: 18px;
      line-height: 1.65;
    }

    .review-line strong,
    .fee-line strong {
      display: block;
      margin-bottom: 1px;
      color: var(--green);
      font-size: 15px;
    }

    .fee-line {
      border-left-color: var(--gold);
      background: var(--gold-soft);
      padding: 10px 12px;
      border-radius: 0 var(--radius) var(--radius) 0;
    }

    .fee-line strong { color: #7c531b; }

    .open-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 50px;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid #ebe7df;
      color: var(--blue);
      font-size: 17px;
      font-weight: 800;
    }

    .chevron {
      display: inline-grid;
      width: 32px;
      height: 32px;
      place-items: center;
      border-radius: 50%;
      background: var(--blue-soft);
      font-size: 24px;
      line-height: 1;
      transition: transform .2s ease;
    }

    details[open] .chevron { transform: rotate(180deg); }

    .route-detail {
      padding: 8px 17px 20px;
      border-top: 1px solid var(--line);
      background: #fbfaf6;
    }

    .activity-line {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 14px 0 18px;
    }

    .activity-line span {
      padding: 7px 10px;
      border: 1px solid #cbd9d0;
      border-radius: var(--radius);
      background: var(--green-soft);
      color: var(--green);
      font-size: 16px;
      font-weight: 800;
    }

    .days-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .days-grid section {
      padding: 16px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--surface-strong);
    }

    .days-grid h4 { font-size: 21px; }

    .timeline {
      margin-top: 12px;
      padding: 0;
      list-style: none;
    }

    .timeline li {
      display: grid;
      grid-template-columns: 88px 1fr;
      gap: 8px;
      padding: 10px 0;
      border-top: 1px solid #ece9e2;
      font-size: 17px;
      line-height: 1.6;
    }

    .timeline li:first-child { border-top: 0; }
    .timeline time { color: var(--rust); font-weight: 800; }

    .detail-photo {
      margin-top: 20px;
      overflow: hidden;
      border-radius: var(--radius);
      background: var(--surface-strong);
    }

    .detail-photo img {
      width: 100%;
      max-height: 420px;
      object-fit: cover;
    }

    .detail-photo figcaption {
      padding: 10px 13px 12px;
      color: var(--muted);
      font-size: 15px;
      line-height: 1.55;
    }

    .evening-stop {
      margin-top: 18px;
      padding: 12px 14px;
      border-radius: var(--radius);
      background: var(--rust-soft);
      font-size: 17px;
    }

    .evening-stop strong { margin-right: 8px; color: var(--rust); }

    .detail-footer {
      margin-top: 16px;
      color: var(--muted);
      font-size: 15px;
      line-height: 1.55;
    }

    .source-link {
      display: inline-flex;
      align-items: center;
      min-height: 50px;
      margin-top: 8px;
      font-size: 17px;
      font-weight: 800;
    }

    .stay-section {
      padding: 54px max(14px, calc((100% - 1180px) / 2)) 72px;
      border-top: 1px solid var(--line);
      background: #e9eee9;
    }

    .stay-section-heading {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 16px;
      padding: 0 0 24px;
      border-bottom: 1px solid #bac9c0;
    }

    .stay-section-heading h2 { font-size: 32px; }
    .stay-section-heading p { margin-top: 7px; color: var(--muted); font-size: 18px; line-height: 1.65; }

    .stay-count {
      display: grid;
      width: 52px;
      height: 52px;
      place-items: center;
      border-radius: 50%;
      background: var(--green);
      color: white;
      font-size: 20px;
      font-weight: 900;
    }

    .stay-content { padding: 24px 0 0; }
    .stay-group + .stay-group { margin-top: 34px; }

    .stay-group-heading {
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 12px 0 13px;
      border-top: 1px solid #bac9c0;
    }

    .stay-group-heading h3 { font-size: 24px; }
    .stay-group-heading span { color: var(--muted); font-size: 16px; }

    .stay-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .stay-card {
      overflow: hidden;
      border: 1px solid #ced7d1;
      border-radius: var(--radius);
      background: var(--surface-strong);
    }

    .stay-card > img {
      width: 100%;
      aspect-ratio: 3 / 2;
      object-fit: cover;
    }

    .stay-body { padding: 16px; }

    .stay-heading {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: start;
      gap: 10px;
    }

    .stay-heading h4 { font-size: 22px; }

    .stay-score {
      min-width: 42px;
      padding: 2px 7px;
      border-radius: var(--radius);
      background: var(--rust-soft);
      color: var(--rust);
      font-size: 17px;
      font-weight: 900;
      text-align: center;
      white-space: nowrap;
    }

    .stay-rating { margin-top: 4px; color: var(--muted); font-size: 14px; }

    .stay-review,
    .stay-confirm {
      margin-top: 10px;
      font-size: 17px;
      line-height: 1.6;
    }

    .stay-review strong,
    .stay-confirm strong {
      margin-right: 7px;
      color: var(--green);
      font-size: 14px;
    }

    .stay-fit {
      margin-top: 10px;
      padding: 7px 10px;
      border-radius: var(--radius);
      background: var(--blue-soft);
      color: #23565e;
      font-size: 15px;
      font-weight: 800;
    }

    .stay-confirm {
      padding: 10px 12px;
      border-radius: var(--radius);
      background: var(--gold-soft);
    }

    .stay-confirm strong { color: #79511a; }

    .stay-source {
      display: inline-flex;
      align-items: center;
      min-height: 48px;
      margin-top: 6px;
      font-size: 16px;
      font-weight: 800;
    }

    .page-note {
      padding: 28px 14px 50px;
      background: #202d27;
      color: #dce5de;
    }

    .page-note-inner {
      width: min(1180px, 100%);
      margin: 0 auto;
    }

    .page-note p { font-size: 15px; line-height: 1.7; }
    .page-note p + p { margin-top: 7px; }
    .page-note a { color: #f0d9b7; }

    @media (min-width: 720px) {
      body { font-size: 20px; }
      html { scroll-padding-top: 140px; }
      .topbar-inner { width: min(1180px, calc(100% - 48px)); }
      .trip-facts strong { font-size: 22px; }
      .trip-facts span { font-size: 18px; }
      .region-nav a { font-size: 18px; }
      .intro { width: min(1180px, calc(100% - 48px)); padding: 64px 0 42px; }
      .intro h1 { font-size: 58px; }
      .intro-lead { font-size: 24px; }
      .overview { width: min(1180px, calc(100% - 48px)); padding: 26px; margin-bottom: 60px; }
      .overview h2 { font-size: 30px; }
      .overview p { font-size: 19px; }
      .overview-choices { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .overview-choices a { padding: 15px 17px; }
      .overview-choices strong { font-size: 21px; }
      .overview-choices span { font-size: 17px; }
      .region-section { padding-top: 58px; padding-bottom: 72px; }
      .region-heading { grid-template-columns: 1fr 1fr; align-items: end; gap: 28px; }
      .region-heading h2 { font-size: 48px; }
      .region-intro { font-size: 19px; }
      .route-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 26px; align-items: start; }
      .route-summary { padding: 23px 22px 21px; }
      .route-summary h3 { font-size: 34px; }
      .route-blurb { font-size: 20px; }
      .review-line, .fee-line { font-size: 19px; }
      .route-detail { padding: 10px 22px 24px; }
      .days-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .timeline li { grid-template-columns: 94px 1fr; font-size: 18px; }
      .stay-section { padding-top: 68px; padding-bottom: 86px; }
      .stay-section-heading { padding-bottom: 30px; }
      .stay-section-heading h2 { font-size: 42px; }
      .stay-section-heading p { font-size: 20px; }
      .stay-content { padding-top: 30px; }
      .stay-group-heading h3 { font-size: 30px; }
      .stay-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
      .stay-heading h4 { font-size: 23px; }
      .stay-review, .stay-confirm { font-size: 18px; }
    }

    @media (min-width: 1040px) {
      .overview-choices { grid-template-columns: repeat(5, minmax(0, 1fr)); }
      .stay-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      *, *::before, *::after { transition: none !important; }
    }
  </style>
</head>
<body>
  <a class="skip-link" href="#main">跳到路线</a>
  <header class="topbar">
    <div class="topbar-inner">
      <div class="trip-facts">
        <strong>10/31–11/1</strong>
        <span>6位成人 · 4间房 · 陆家嘴出发</span>
      </div>
      <nav class="region-nav" aria-label="路线地区">
        ${regionLinks}
      </nav>
    </div>
  </header>

  <main id="main">
    <section class="intro" aria-labelledby="page-title">
      <p class="intro-label">两天一夜 · 玩优先</p>
      <h1 id="page-title">先选去哪玩，再决定晚上住哪。</h1>
      <p class="intro-lead">
        <strong>${routeCount} 条玩法路线</strong>先按白天体验比较；住宿放在最后，只负责晚上落脚。上海近郊之外，新增 3 条苏州跨城玩法，车程会更长。
      </p>
    </section>

    <section class="overview" aria-labelledby="overview-title">
      <h2 id="overview-title">今天想怎么玩？</h2>
      <p>不用从头翻到尾，先选一个方向。</p>
      <div class="overview-choices">
        <a href="#region-qingpu"><strong>想看水乡和湖</strong><span>朱家角 · 淀山湖 · 青西</span></a>
        <a href="#region-jinshan"><strong>想吃海鲜拍花</strong><span>金山嘴 · 枫泾 · 花开海上</span></a>
        <a href="#region-fengxian"><strong>想轻松不暴走</strong><span>上海之鱼 · 青溪 · 手作</span></a>
        <a href="#region-pudong"><strong>想离上海更近</strong><span>滴水湖 · 新场 · 川沙</span></a>
        <a href="#region-suzhou"><strong>愿意为玩法开远点</strong><span>锦溪 · 周庄 · 太湖西山</span></a>
      </div>
    </section>

    ${routeSections}

    <section class="stay-section" id="stays" aria-labelledby="stays-title">
      <header class="stay-section-heading">
        <div>
          <h2 id="stays-title">晚上住哪</h2>
          <p>先按白天玩法选方向，再看就近落脚。${stayCount} 处候选都直接展开，4 间房能否满足也写在卡片里。</p>
        </div>
        <span class="stay-count" aria-label="${stayCount} 处住宿候选">${stayCount}</span>
      </header>
      <div class="stay-content">
        ${staySections}
      </div>
    </section>
  </main>

  <footer class="page-note">
    <div class="page-note-inner">
      <p>资料复核：携程问道、美团旅行 CLI、高德 MCP。具体票价、开放时间、船班和收费项目会变，出发前再查一次官方渠道。</p>
      <p>觅家·一夜花香来自携程截图登记，线上三源暂时没有精确同名结果；预订前请在携程 App 复核在售状态和房东口径。</p>
    </div>
  </footer>
</body>
</html>
`;

fs.writeFileSync(outputPath, html.replace(/[ \t]+$/gm, ""), "utf8");
console.log(`Wrote ${path.basename(outputPath)}`);
console.log(`Routes: ${routeCount}; stays: ${stayCount}`);
