import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const publishRoot = path.resolve(here, "..");
const baselinePath = path.resolve(publishRoot, "..", "trip-data.json");
const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const amapRouteDataPath = path.join(publishRoot, "research", "v4", "amap-v5-routes.json");
const amapRouteData = JSON.parse(fs.readFileSync(amapRouteDataPath, "utf8"));
const outputPath = path.join(publishRoot, "weekend-trip-plans-2026-10-31-v5.html");

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
    travel: "高德驾车 59.9 km · 约 110 分钟"
  },
  "02": {
    group: "qingpu",
    fee: "帆船要预约，6 人票价和天气退改先问；金泽免大门票，游船现场问价。",
    travel: "高德驾车 57.1 km · 约 78 分钟"
  },
  "03": {
    group: "qingpu",
    fee: "古镇免费；3 景点联票约 45–55 元；游船 200–300 元/船，最多 6 人。",
    travel: "高德驾车 50.9 km · 约 70 分钟"
  },
  "11": {
    group: "qingpu",
    fee: "公园免费；电瓶车 20 元/人；水上森林 16:00 停止进入，游船收费先问。",
    travel: "高德驾车 59.2 km · 约 107 分钟"
  },
  "16": {
    group: "qingpu",
    fee: "门票 45 元起，观光车 40 元/人；园内项目另收费，最晚 16:00 入园。",
    travel: "高德驾车 53.4 km · 约 75 分钟"
  },
  "04": {
    group: "jinshan",
    fee: "城市沙滩非泳期入园免费，游船/帆船/皮划艇另收费；金山嘴老街免费。",
    travel: "高德驾车 76.1 km · 约 90 分钟"
  },
  "05": {
    group: "jinshan",
    fee: "古镇免费；场馆通票约 42 元；手摇船约 40 分钟，票价现场问。",
    travel: "高德驾车 69.2 km · 约 95 分钟"
  },
  "06": {
    group: "jinshan",
    fee: "枫叶岛免费，停车免费但车位少；划船收费先问；廊华路部分施工。",
    travel: "高德驾车 88.7 km · 约 126 分钟"
  },
  "15": {
    group: "jinshan",
    fee: "门票 30 元、实名入园；停车免费；观光车和多人车收费先问。",
    travel: "高德驾车 73.0 km · 约 121 分钟"
  },
  "09": {
    group: "fengxian",
    fee: "上海之鱼免费；科幻馆 128 元起可选；奉贤博物馆免费，乾隆特展 11/18 撤展。",
    travel: "高德驾车 40.6 km · 约 98 分钟"
  },
  "12": {
    group: "fengxian",
    fee: "园区无门票；烧烤 500 元/次；成人手作和烘焙需先问场次与收费。",
    travel: "高德驾车 35.0 km · 约 64 分钟"
  },
  "13": {
    group: "fengxian",
    fee: "老街免费；摇橹船价格现场问；望海楼登楼或品茗需提前预约。",
    travel: "高德驾车 39.5 km · 约 92 分钟"
  },
  "08": {
    group: "pudong",
    fee: "滴水湖免费；游船成人 100 元；航海馆 30 元、AR 另加 99 元；水上项目预约后问价。",
    travel: "高德驾车 67.3 km · 约 103 分钟"
  },
  "14": {
    group: "pudong",
    fee: "古镇免费；内部小馆单独购票；摇橹船先问价；剧本餐秀 138 元/人可选。",
    travel: "高德驾车 33.1 km · 约 53 分钟"
  },
  "17": {
    group: "pudong",
    fee: "迪士尼 10/31–11/1 开放至 22:00；1日票 449 元起。川沙老街免费；轮渡 15 元/人。",
    travel: "高德驾车 29.9 km · 约 55 分钟"
  }
};

const groups = [
  {
    id: "qingpu",
    eyebrow: "水乡 · 湖岸 · 森林",
    title: "青浦",
    intro: "湖、森林和经典水乡最集中；适合白天玩够，晚上回湖边或古镇附近住。"
  },
  {
    id: "jinshan",
    eyebrow: "海边 · 古镇 · 花田",
    title: "金山",
    intro: "看海、吃海鲜、逛古镇都在这里；适合愿意多开一点路换海边氛围。"
  },
  {
    id: "fengxian",
    eyebrow: "海边 · 手作 · 庭院",
    title: "奉贤",
    intro: "海边和庭院住宿能放在一条线里；适合白天少跑、晚上一起玩。"
  },
  {
    id: "pudong",
    eyebrow: "乐园 · 古镇 · 湖岸",
    title: "浦东",
    intro: "迪士尼、海昌、新场、川沙方向多；住别墅或古镇里，转场最顺。"
  },
  {
    id: "suzhou",
    eyebrow: "古镇 · 太湖 · 岛岸",
    title: "苏州",
    intro: "锦溪、周庄和太湖东西山；车程更长，但住宿和湖景更像一次小度假。"
  }
];

const routeStayIds = {
  "02": ["liuxia", "sun"],
  "03": ["shaoguang", "liuxia"],
  "16": ["liuxia", "shaoguang"],
  "04": ["qingfeng", "hanqi"],
  "05": ["qingfeng", "hanqi"],
  f01: ["duoyun", "banxia"],
  "12": ["banxia", "new_daojia"],
  "14": ["new_nongshe", "new_xianshe"],
  p01: ["zhuji", "sangu"],
  "17": ["shiguangli", "new_xianshe"],
  s01: ["chengyu"],
  s02: ["miyi"],
  s03: ["sanjo", "xishan"],
  s04: ["shuyun"]
};

const mapOrigin = {
  name: "陆家嘴",
  lon: 121.507513,
  lat: 31.234295
};

const routeMapPoints = [
  { id: "01", group: "qingpu", short: "01", name: "太阳岛", lon: 121.073990, lat: 31.034700 },
  { id: "02", group: "qingpu", short: "02", name: "淀山湖", lon: 121.009195, lat: 31.131111 },
  { id: "02", group: "qingpu", short: "02b", name: "金泽古镇", lon: 120.920059, lat: 31.034181 },
  { id: "03", group: "qingpu", short: "03", name: "朱家角", lon: 121.053846, lat: 31.111260 },
  { id: "04", group: "jinshan", short: "04", name: "金山嘴", lon: 121.376304, lat: 30.733027 },
  { id: "05", group: "jinshan", short: "05", name: "枫泾", lon: 121.014236, lat: 30.886131 },
  { id: "06", group: "jinshan", short: "06", name: "廊下", lon: 121.174735, lat: 30.775134 },
  { id: "08", group: "pudong", short: "08", name: "滴水湖", lon: 121.910286, lat: 30.891553 },
  { id: "09", group: "fengxian", short: "09", name: "上海之鱼", lon: 121.495817, lat: 30.936745 },
  { id: "11", group: "qingpu", short: "11", name: "青西郊野公园", lon: 121.007099, lat: 31.049409 },
  { id: "12", group: "fengxian", short: "12", name: "花开半夏", lon: 121.532529, lat: 30.984180 },
  { id: "13", group: "fengxian", short: "13", name: "青溪老街", lon: 121.583632, lat: 30.922468 },
  { id: "14", group: "pudong", short: "14", name: "新场古镇", lon: 121.642786, lat: 31.023532 },
  { id: "15", group: "jinshan", short: "15", name: "花开海上", lon: 121.115501, lat: 30.880772 },
  { id: "16", group: "qingpu", short: "16", name: "东方绿舟", lon: 121.014970, lat: 31.100305 },
  { id: "17", group: "pudong", short: "17", name: "川沙古镇", lon: 121.705290, lat: 31.196087 },
  { id: "17", group: "pudong", short: "17b", name: "比斯特上海", lon: 121.676273, lat: 31.136416 },
  { id: "s01", group: "suzhou", short: "S1", name: "锦溪古镇", lon: 120.902516, lat: 31.177927 },
  { id: "s02", group: "suzhou", short: "S2", name: "周庄古镇", lon: 120.850910, lat: 31.114744 },
  { id: "s03", group: "suzhou", short: "S3", name: "太湖缥缈峰", lon: 120.255924, lat: 31.116207 }
];

const activeRouteIds = new Set([
  "02", "03", "16",
  "04", "05",
  "f01", "12",
  "14", "p01", "17",
  "s01", "s02", "s03", "s04"
]);

const stayMeta = {
  shiguang: {
    group: "pudong",
    amenities: ["KTV", "棋牌", "花园"],
    review: "村里安静，KTV、棋牌和花园适合晚上自娱；白天去湖边还要开车。",
    confirm: "现有资料只有 3 间房；要满足 4 房，必须另问加房或换房型。",
    fit: "资料仅 3 间，不匹配"
  },
  sun: {
    group: "qingpu",
    amenities: ["别墅", "岛内玩乐", "温泉待确认"],
    review: "玩乐项目集中在岛内，晚上省得再开车；温泉先确认是否开池。",
    confirm: "俱乐部别墅资料是 3 卧；要住 4 房需另问房型组合。",
    fit: "资料仅 3 卧，不匹配"
  },
  hanqi: {
    group: "jinshan",
    amenities: ["独栋", "麻将/棋牌", "K歌", "烧烤"],
    review: "就在枫叶岛内，白天看叶色，晚上回独栋烧烤唱歌；4 室包栋正合适。",
    confirm: "确认 4 室床型、10 月底房态、烧烤区和宠物清洁规则。",
    fit: "有 4 室包栋候选"
  },
  sangu: {
    group: "pudong",
    amenities: ["独栋", "KTV", "影音"],
    review: "去年新装修，影音和 KTV 齐全；离滴水湖岸边约 4 公里。",
    confirm: "整栋共 5 间客房，能否只开 4 房必须问。",
    fit: "5 间，4 房使用待确认"
  },
  new_fusheng: {
    group: "qingpu",
    amenities: ["稻田", "院落", "乡村"],
    review: "稻田和乡村环境安静，离青西公园近；晚上适合少跑。",
    confirm: "现有资料偏 3 房；必须确认能否凑足 4 卧并单独使用公区。",
    fit: "资料仅 3 房，待确认"
  },
  banxia: {
    group: "fengxian",
    amenities: ["庭院", "手作", "KTV", "草坪"],
    review: "庭院 LOFT 看星星，手作、土灶、KTV 和草坪活动都集中在园内。",
    confirm: "6 人 4 间的组合、成人手作场次、烧烤开放规则都要问。",
    fit: "可拼 4 间，组合待确认"
  },
  new_daojia: {
    group: "fengxian",
    amenities: ["老街内", "KTV", "棋牌室"],
    review: "就住在老街里，出门就是夜景和小吃；KTV、棋牌室齐全。",
    confirm: "7 间房里如何挑 4 间、KTV 晚间时段、烧烤和停车先问。",
    fit: "7 间可选 4 间，待确认"
  },
  new_nongshe: {
    group: "pudong",
    amenities: ["古镇内", "整栋", "近小吃"],
    review: "就在新场古镇大街，晚上逛完直接走回去，整栋住 6 人刚好。",
    confirm: "整栋只有 3 间卧室，满足不了 4 房需求；只能按 3 房 6 人方案考虑。",
    fit: "仅 3 卧，不适合 4 房"
  },
  new_guiyuan: {
    group: "jinshan",
    amenities: ["草坪庭院", "泳池", "拍照"],
    review: "草坪庭院适合拍照和慢住，离花开海上玩法近。",
    confirm: "现有资料偏 3 房；4 房满足方式、做饭规则和公区收费先问。",
    fit: "资料仅 3 房，待确认"
  },
  new_shuyuan: {
    group: "pudong",
    amenities: ["江南园林", "酒店服务", "安静"],
    review: "江南园林环境舒服，房间安静，适合临港落脚。",
    confirm: "一次订4间、相邻房和早餐份数先问。",
    fit: "可订4间，先问相邻"
  },
  new_xianshe: {
    group: "pudong",
    amenities: ["独栋", "泳池", "KTV", "烧烤"],
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
    placeReview: {
      items: [
        { source: "美团", score: "3.9" },
        { source: "高德", score: "4.7" }
      ],
      note: "评价条数未返回；两平台口径不同"
    },
    rating: {
      name: "锦溪古镇 · 水乡慢逛＋计家墩理想村",
      parts: [37, 20, 14, 6],
      total: 77,
      stars: 4,
      confidence: "中偏低",
      reason: "锦溪有古镇实景，计家墩能接住院子和晚饭；但路线偏慢逛，景点强度不算高。",
      deductions: "美团景点评分3.9，古镇内容更适合不赶时间的人；计家墩与民宿的4卧开放范围仍需房东确认。",
      evidence: "美团景点评分与票价、携程问道民宿名称地址、高德计家墩地理锚点。"
    },
    tags: ["水乡", "院子烧烤", "慢住"],
    fee: "锦溪园内套票约40元，游船约180元/船、最多6人；手作、皮划艇和烧烤另问价。",
    travel: "高德驾车 68.1 km · 约 109 分钟",
    photo: "assets/routes/route-s01.jpg",
    photoAlt: "锦溪古镇河巷、石桥与游船",
    photoCaption: "锦溪古镇｜来源：高德 POI 相册",
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
    placeReview: {
      items: [
        { source: "美团", score: "4.4" },
        { source: "高德", score: "4.7" }
      ],
      note: "评价条数未返回；两平台口径不同"
    },
    rating: {
      name: "周庄古镇 · 白天水巷＋晚上看灯",
      parts: [41, 22, 11, 7],
      total: 81,
      stars: 4.5,
      confidence: "中",
      reason: "周庄白天水巷和夜游内容都成熟，住镇内能把夜景变成完整体验。",
      deductions: "古镇商业化和节假日人流都明显；停车后还要转运行李，摇橹船等体验另收费。",
      evidence: "美团景点评分与公开票价、携程截图民宿登记、高德周庄坐标；夜游按公开资料复核。"
    },
    tags: ["水乡夜景", "摇橹船", "古镇住一晚"],
    fee: "周庄古镇成人票约72元；摇橹船约220元/船、最多6人；停车和行李接送先问房东。",
    travel: "高德驾车 79.6 km · 约 125 分钟",
    photo: "assets/routes/route-s02.jpg",
    photoAlt: "周庄古镇夜晚水巷与临水民居",
    photoCaption: "周庄古镇｜来源：高德 POI 相册",
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
    placeReview: {
      items: [
        { source: "美团", score: "4.1", count: "292条" },
        { source: "高德", score: "4.2" }
      ],
      note: "两平台口径不同；美团评价条数已返回"
    },
    rating: {
      name: "太湖西山 · 雕花楼＋缥缈峰＋院子",
      parts: [39, 21, 9, 7],
      total: 76,
      stars: 4,
      confidence: "中偏低",
      reason: "雕花楼、缥缈峰和太湖湖景组合有辨识度，适合愿意为一处远郊目的地多开车的一天。",
      deductions: "单程约145分钟；缥缈峰台阶多、景区交通另算，天气差时湖景和登山体验都会打折。",
      evidence: "美团景点评分和票价、携程与美团民宿口径、高德缥缈峰坐标。"
    },
    tags: ["太湖", "古村古建", "泳池院子"],
    fee: "缥缈峰门票含景区交通约65元；雕花楼票价以官方渠道为准；泳池、烧烤、麻将开放与收费先问房东。",
    travel: "高德驾车 141.7 km · 约 162 分钟",
    photo: "assets/routes/route-s03.jpg",
    photoAlt: "太湖缥缈峰山顶眺望湖面与群山",
    photoCaption: "太湖缥缈峰｜来源：高德 POI 相册",
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
  },
  {
    id: "f01",
    group: "fengxian",
    area: "奉贤 · 海湾 / 吴房村",
    title: "碧海金沙 · 海边散步＋吴房村住一晚",
    blurb: "非泳期不安排下水，白天看海、走沙滩，晚上回吴房村 4 室别墅。",
    review: "这条适合想看海但不想跑金山的人；住宿 4 房匹配度比海边散房更稳。",
    placeReview: {
      items: [
        { source: "高德", score: "4.2" },
        { source: "携程", detail: "非泳期 30 元" }
      ],
      note: "10月底按非泳期安排，水上项目看天气"
    },
    rating: {
      name: "碧海金沙 · 海边散步＋吴房村住一晚",
      parts: [36, 20, 15, 7],
      total: 78,
      stars: 4,
      confidence: "中",
      reason: "海边、吴房村和独栋住宿组合顺路，玩法轻松。",
      deductions: "海边体验看天气，非泳期水上项目不一定开；朵云闲居的房型在携程和美团口径不同。",
      evidence: "高德 POI 与开放时间、携程非泳期票价、美团住宿距离与评价。"
    },
    tags: ["海边", "非泳期", "4室别墅"],
    fee: "碧海金沙非泳期成人票 30 元；帆板、皮划艇和烧烤另收费先问。",
    travel: "高德驾车 54.1 km · 约 84 分钟",
    photo: "assets/routes/route-f01.jpg",
    photoAlt: "碧海金沙海边与沙滩",
    photoCaption: "碧海金沙｜来源：高德 POI 相册",
    activities: ["碧海金沙海边散步", "渔人码头看海", "吴房村院落和桌游"],
    day1: [
      ["09:00–10:30", "陆家嘴出发到碧海金沙"],
      ["10:30–12:00", "沙滩和海边步道，水上项目先问"],
      ["12:00–13:30", "海湾附近午饭"],
      ["14:00–16:00", "渔人码头或吴房村短走"],
      ["16:30以后", "回朵云闲居入住，烧烤、棋牌或桌游"]
    ],
    day2: [
      ["08:30–09:30", "早餐"],
      ["09:30–11:00", "吴房村或海边短走"],
      ["11:30", "退房"],
      ["12:00以后", "午饭后返沪"]
    ],
    source: "https://m.ctrip.com/webapp/you/gspoi/sight/2/0.html?poiId=10758345"
  },
  {
    id: "p01",
    group: "pudong",
    area: "浦东 · 临港 / 海昌",
    title: "海昌海洋公园 · 游乐＋滴水湖",
    blurb: "周六把海昌玩完整，晚上住临港或川沙别墅；第二天滴水湖轻松收尾。",
    review: "比只去滴水湖更有内容；但住宿口径冲突明显，订前要逐项确认。",
    placeReview: {
      items: [
        { source: "高德", score: "4.7" },
        { source: "携程", detail: "09:30–21:00" }
      ],
      note: "海昌内容丰富，部分设备可能维保"
    },
    rating: {
      name: "海昌海洋公园 · 游乐＋滴水湖",
      parts: [41, 22, 12, 7],
      total: 82,
      stars: 4.5,
      confidence: "中",
      reason: "海洋馆、演出和游乐设施够白天玩，湖边第二天不赶。",
      deductions: "住宿泳池口径在携程和美团冲突；周末剧场时间和设备开放要当天看。",
      evidence: "携程开放时间与票价、高德 POI 评分、美团住宿交叉复核。"
    },
    tags: ["乐园", "湖岸", "晚上可玩"],
    fee: "海昌成人票 199 元起；停车按时段收费；园内项目和剧场以当天开放为准。",
    travel: "高德驾车 68.8 km · 约 80 分钟",
    photo: "assets/routes/route-p01.jpg",
    photoAlt: "上海海昌海洋公园入口",
    photoCaption: "上海海昌海洋公园｜来源：高德 POI 相册",
    activities: ["海昌海洋公园", "滴水湖短走", "别墅泳池/KTV待确认"],
    day1: [
      ["08:30–09:50", "陆家嘴出发到海昌"],
      ["10:00–12:00", "先看最想看的馆和演出"],
      ["12:00–13:00", "园内午饭"],
      ["13:00–18:00", "游乐设施和剧场组合"],
      ["18:30以后", "回竹迹或临港别墅，KTV/棋牌/烧烤先确认"]
    ],
    day2: [
      ["09:00–10:00", "早餐"],
      ["10:00–12:00", "滴水湖或航海博物馆二选一"],
      ["12:00以后", "午饭后返沪"]
    ],
    source: "https://m.ctrip.com/webapp/you/gspoi/sight/2/0.html?poiId=52075446"
  },
  {
    id: "s04",
    group: "suzhou",
    area: "苏州 · 太湖东山",
    title: "太湖东山 · 陆巷古村＋湖边庄园",
    blurb: "白天陆巷古村、雕花楼和太湖公路，晚上回庄园别墅烧烤唱歌。",
    review: "东山比西山少点孤岛感，但庄园住宿和古村内容更均衡。",
    placeReview: {
      items: [
        { source: "携程", score: "3.9", count: "818条" },
        { source: "高德", score: "4.4" }
      ],
      note: "陆巷古村偏生活化，不是高强度景区"
    },
    rating: {
      name: "太湖东山 · 陆巷古村＋湖边庄园",
      parts: [40, 22, 12, 8],
      total: 82,
      stars: 4.5,
      confidence: "中",
      reason: "古村、湖景和庄园住宿组合完整，适合多人聚。",
      deductions: "车程约两小时，周末太湖方向可能堵；墅之韵 4 房口径在携程和美团之间不同。",
      evidence: "携程景点票价和评分、高德 POI、美团住宿设施与评价数。"
    },
    tags: ["太湖", "古村", "庄园聚会"],
    fee: "陆巷古村成人票约58.5元；雕花楼约54元；橘子采摘、烧烤和湖鲜另问。",
    travel: "高德驾车 131.0 km · 约 123 分钟",
    photo: "assets/routes/route-s04.jpg",
    photoAlt: "陆巷古村村口",
    photoCaption: "陆巷古村｜来源：高德 POI 相册",
    activities: ["陆巷古村", "东山雕花楼", "墅之韵庄园泳池/KTV"],
    day1: [
      ["08:00–10:10", "陆家嘴出发到东山"],
      ["10:30–12:30", "陆巷古村紫石街和牌坊"],
      ["12:30–13:30", "东山镇午饭"],
      ["14:00–16:30", "雕花楼或启园二选一，湖边看日落"],
      ["17:00以后", "回墅之韵入住，泳池/KTV/烧烤"]
    ],
    day2: [
      ["08:30–09:30", "民宿早餐"],
      ["09:30–11:00", "湖边短走或果园采摘"],
      ["11:30", "退房"],
      ["12:00以后", "午饭后返沪"]
    ],
    source: "https://m.ctrip.com/webapp/you/gspoi/sight/11/0.html?poiId=76172"
  }
];

const newStays = [
  {
    id: "chengyu",
    name: "橙屿民宿（锦溪·计家墩）",
    group: "suzhou",
    rating: "5.0",
    ratingLabel: "携程 3条评价",
    amenities: ["独栋", "院子", "烧烤", "桌游"],
    review: "院子安静，适合6个人烧烤、聊天、慢住。",
    confirm: "5房整套只开4卧是否可行、早餐份数、烧烤和停车必须问。",
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
    amenities: ["独栋", "古镇内", "院子"],
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
    amenities: ["4房", "院子", "泳池", "麻将"],
    review: "4房刚好，泳池和院子适合6个人聚会。",
    confirm: "详细门牌、4房开放、泳池是否开放及收费、厨房烧烤规则先问；床型两平台口径不同。",
    fit: "4房，人数匹配",
    photo: "assets/stays/xibaifang-hero.jpg",
    photoAlt: "小白房建筑与门楣招牌",
    source: "http://dpurl.cn/my0XrrHz",
    sourceLabel: "美团主体精确命中"
  },
  {
    id: "liuxia",
    name: "淀山湖·留夏拾光民宿",
    group: "qingpu",
    rating: "4.6 / 4.7",
    ratingLabel: "携程83条 / 美团49条",
    amenities: ["KTV", "棋牌", "烧烤", "游戏室", "庭院"],
    review: "湖边住一晚最省心，KTV、烧烤、游戏室都齐，适合6人晚上继续玩。",
    confirm: "公共 KTV、烧烤区和厨房使用要预约错峰；4房具体床型订前确认。",
    fit: "5/6室套房可覆盖4房",
    photo: "assets/stays/stay-liuxia.jpg",
    photoAlt: "淀山湖留夏拾光民宿庭院",
    source: "https://hotels.ctrip.com/hotels/66663276.html",
    sourceLabel: "携程房源页"
  },
  {
    id: "shaoguang",
    name: "韶光度假别墅（朱家角）",
    group: "qingpu",
    rating: "4.7",
    ratingLabel: "携程 6条评价",
    amenities: ["包栋", "棋牌", "影院", "庭院", "厨房"],
    review: "离朱家角近，院子、厨房和影音空间适合小聚。",
    confirm: "携程写三居包栋，不等于4间独立卧室；床型和4房方案必须问。",
    fit: "三居包栋，4房有风险",
    photo: "assets/stays/stay-shaoguang.jpg",
    photoAlt: "韶光度假别墅庭院",
    source: "https://hotels.ctrip.com/hotels/91987537.html",
    sourceLabel: "携程房源页"
  },
  {
    id: "qingfeng",
    name: "花筑·清风拾光（枫泾）",
    group: "jinshan",
    rating: "4.8",
    ratingLabel: "携程 252条评价",
    amenities: ["棋牌", "泳池", "烧烤", "庭院", "轰趴"],
    review: "三面环河，院子、泳池和烧烤区适合聚会；离枫泾和金山海边都顺。",
    confirm: "以单间/双床房为主，订4间会和其他客人同栋；公共烧烤和棋牌区先预约。",
    fit: "可订4间，非独栋",
    photo: "assets/stays/stay-qingfeng.jpg",
    photoAlt: "花筑清风拾光民宿庭院",
    source: "https://hotels.ctrip.com/hotels/119970897.html",
    sourceLabel: "携程房源页"
  },
  {
    id: "duoyun",
    name: "上海朵云闲居民宿（吴房村）",
    group: "fengxian",
    rating: "5.0 / 3.9",
    ratingLabel: "携程 / 美团37条",
    amenities: ["4室别墅", "KTV", "棋牌", "烧烤", "茶室"],
    review: "携程有4室4卫别墅，正好贴6人4房；美团只确认到烧烤和37条评价。",
    confirm: "房型信息两平台不一致；4室4卫是否可订、KTV和烧烤时段都要问。",
    fit: "携程有4室4卫，待复核",
    photo: "assets/stays/stay-duoyun.jpg",
    photoAlt: "朵云闲居民宿庭院",
    source: "https://hotels.ctrip.com/hotels/88808860.html",
    sourceLabel: "携程房源页"
  },
  {
    id: "zhuji",
    name: "上海竹迹别墅",
    group: "pudong",
    rating: "4.9 / 4.6",
    ratingLabel: "携程 / 美团16条",
    amenities: ["KTV", "棋牌", "游戏室", "烧烤", "泳池待确认"],
    review: "整栋轰趴空间大，适合晚上不出门；但泳池是否开放两平台说法冲突。",
    confirm: "携程写室外泳池，美团说没有泳池；10月退房10:00较早，4房和泳池都要确认。",
    fit: "整栋10间，可覆盖4房",
    photo: "assets/stays/stay-zhuji.jpg",
    photoAlt: "上海竹迹别墅公共区",
    source: "https://hotels.ctrip.com/hotels/18435041.html",
    sourceLabel: "携程房源页"
  },
  {
    id: "shiguangli",
    name: "如果拾光里别墅（迪士尼）",
    group: "pudong",
    rating: "4.7 / 4.5",
    ratingLabel: "携程190条 / 美团22条",
    amenities: ["泳池", "烧烤", "棋牌", "花园", "接送"],
    review: "离迪士尼近，院子泳池适合收尾；但4房包栋口径两平台不一致。",
    confirm: "携程写6/7房包栋，美团只见单间/双床房；能否4房同订和是否拼栋必须问。",
    fit: "包栋口径冲突，订前确认",
    photo: "assets/stays/stay-shiguangli.jpg",
    photoAlt: "如果拾光里别墅庭院",
    source: "https://hotels.ctrip.com/hotels/76147352.html",
    sourceLabel: "携程房源页"
  },
  {
    id: "sanjo",
    name: "Sanjo三江·湖景民宿（西山）",
    group: "suzhou",
    rating: "4.9 / 4.6",
    ratingLabel: "携程716条 / 美团",
    amenities: ["4房小院", "泳池", "KTV", "麻将", "烧烤"],
    review: "湖景、4房小院、泳池和KTV都明确，西山住宿里适配度最高。",
    confirm: "KTV和烧烤收费、泳池天气开放、4房小院的实际床型先问。",
    fit: "4房小院，匹配6人4房",
    photo: "assets/stays/stay-sanjo.jpg",
    photoAlt: "Sanjo三江湖景民宿外观",
    source: "https://hotels.ctrip.com/hotels/126313505.html",
    sourceLabel: "携程房源页"
  },
  {
    id: "shuyun",
    name: "墅之韵太湖庄园别墅（东山）",
    group: "suzhou",
    rating: "4.8",
    ratingLabel: "携程高分 / 美团3条",
    amenities: ["4室套房", "泳池", "KTV", "麻将", "烧烤", "湖景"],
    review: "大草坪、泳池、KTV和麻将都齐，像为一个团队周末准备。",
    confirm: "携程写四室一厅，美团只见六室/八室/包栋；4房到底怎么开必须问。",
    fit: "四室一厅口径待复核",
    photo: "assets/stays/stay-shuyun.jpg",
    photoAlt: "墅之韵太湖庄园别墅",
    source: "https://hotels.ctrip.com/hotels/6007008.html",
    sourceLabel: "携程房源页"
  }
];

const groupLookup = new Map(groups.map((group) => [group.id, group]));

function formatPlaceScore(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(1) : "";
}

function buildCtripPlaceReview(place) {
  const score = formatPlaceScore(place?.score);
  if (!score) {
    return {
      items: [{ source: "官方项目页", detail: "评分不单列" }],
      note: "非游客平台聚合评分"
    };
  }

  const count = place.count && place.count !== "—" ? `${place.count}条` : "";
  return {
    items: [{ source: "携程", score, count }],
    note: Number(place.count) > 0 && Number(place.count) < 10
      ? "样本少，仅供参考"
      : count
        ? ""
        : "评价条数未返回"
  };
}

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
    placeReview: buildCtripPlaceReview(baseline.reviewData[route.n].place),
    rating: baseline.routeRatings[route.n],
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
    source: firstSource
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
    amenities: meta.amenities,
    review: meta.review,
    confirm: meta.confirm,
    fit: meta.fit,
    photo: `assets/stays/stay-${stay.key}.jpg`,
    photoAlt: stay.photos[0].caption,
    source: stay.source,
    sourceLabel: "携程房源页"
  };
});

const v5RouteOverrides = {
  "02": {
    title: "淀山湖 · 湖岸骑行＋金泽古镇",
    blurb: "上午沿湖骑行或问水上项目，下午去金泽慢走喝茶；晚上回湖边民宿继续玩。",
    review: "湖岸和古镇组合完整，住宿就在蔡浜村；水上项目没约到也能改成慢逛。",
    tags: ["湖岸", "水上项目先约", "住宿近"],
    day1: [
      ["08:30–10:00", "陆家嘴出发，按导航到淀山湖"],
      ["10:00–12:00", "环湖大道骑行或湖边短走"],
      ["12:00–13:30", "金泽或湖边农家菜午饭"],
      ["14:00–16:30", "金泽古镇古桥慢逛，水上项目看预约情况"],
      ["16:30以后", "回留夏拾光入住，KTV、烧烤或桌游"]
    ],
    day2: [
      ["08:30–09:30", "民宿早餐"],
      ["09:30–11:00", "湖边短走或补一个轻松项目"],
      ["11:00–11:30", "退房"],
      ["12:00以后", "午饭后返沪"]
    ]
  },
  "16": {
    title: "东方绿舟 · 航母＋草地＋淀山湖住宿",
    blurb: "白天看仿真航母和湖滨草地，晚上住到淀山湖边，晚上不用赶回市区。",
    review: "航母和兵器馆是真亮点；园区项目别贪多，挑两个就够。",
    tags: ["大型园区", "拍照", "住宿近"],
    day2: [
      ["08:30–09:30", "民宿早餐"],
      ["09:30–11:00", "淀山湖边短走或咖啡"],
      ["11:00–11:30", "退房"],
      ["12:00以后", "午饭后返沪"]
    ]
  },
  "04": {
    title: "金山城市沙滩 · 海边＋金山嘴海鲜",
    blurb: "上午看海踩沙，下午回金山嘴吃海鲜逛老街；非泳期不安排下水。",
    review: "海边氛围和城市沙滩项目够用；真正吃的是金山嘴的海鲜和老街烟火气。",
    tags: ["海边", "海鲜", "晴天更好"],
    photoAlt: "金山城市沙滩、海滨与亲水活动",
    photoCaption: "金山城市沙滩｜来源：高德 POI 相册",
    activities: ["金山城市沙滩", "金山嘴渔村海鲜", "老街短逛"],
    day1: [
      ["08:30–10:00", "陆家嘴出发到金山城市沙滩"],
      ["10:00–12:00", "沙滩和滨海步道，水上项目先问价"],
      ["12:00–13:30", "金山嘴渔村午饭"],
      ["14:00–16:00", "渔村老街和展馆挑一两个"],
      ["16:30以后", "回民宿，烧烤、棋牌或桌游"]
    ],
    day2: [
      ["08:30–09:30", "早餐"],
      ["09:30–11:00", "海边或村里短走"],
      ["11:30", "退房"],
      ["12:00以后", "午饭后返沪"]
    ]
  },
  "12": {
    photoAlt: "花开半夏活动园区的院子、草坪与泳池",
    photoCaption: "花开半夏活动园区｜玩法与住宿在同一处"
  },
  "17": {
    title: "迪士尼 · 乐园＋川沙老街",
    blurb: "周六把迪士尼玩完整，晚上住川沙附近别墅；周日用老街和比斯特收尾。",
    review: "适合想认真玩一天乐园的人；住得近是最大优势，第二天不用硬排项目。",
    placeReview: {
      items: [
        { source: "高德", score: "4.9" },
        { source: "携程", detail: "10/31–11/1 开放至 22:00" }
      ],
      note: "乐园评价高，但周末排队和票价都要接受"
    },
    rating: {
      name: "迪士尼 · 乐园＋川沙老街",
      parts: [42, 22, 12, 8],
      total: 84,
      stars: 4.5,
      confidence: "中",
      reason: "乐园内容最满，住宿也近；但门票、排队和体力消耗都高。",
      deductions: "周末热门项目排队；迪士尼票价高，住宿包栋口径在携程和美团之间有冲突，订前必须复核。",
      evidence: "携程开放时间、迪士尼 POI 高德评分、美团住宿评价与房型冲突记录。"
    },
    tags: ["主题乐园", "住得近", "第二天轻松"],
    fee: "迪士尼 1 日票 449 元起；川沙老街免费；星愿湖轮渡 15 元/人。",
    travel: "高德驾车 29.9 km · 约 55 分钟",
    photo: "assets/routes/route-17-disney.jpg",
    photoAlt: "上海迪士尼度假区入口",
    photoCaption: "上海迪士尼度假区｜来源：高德 POI 相册",
    activities: ["上海迪士尼", "川沙老街", "比斯特上海"],
    day1: [
      ["08:00–08:50", "陆家嘴出发到迪士尼"],
      ["09:00–12:00", "优先玩最想排的项目"],
      ["12:00–13:00", "园内午饭"],
      ["13:00–18:00", "演出＋项目组合，别硬排满"],
      ["18:00–21:30", "晚饭和夜间项目"],
      ["21:30以后", "回拾光里或附近别墅休息"]
    ],
    day2: [
      ["09:00–10:00", "早餐"],
      ["10:00–12:00", "川沙老街短逛"],
      ["12:00–13:30", "比斯特午饭或咖啡"],
      ["14:00以后", "返沪"]
    ],
    source: "https://m.ctrip.com/webapp/you/gspoi/sight/2/0.html?poiId=13412802"
  }
};

const amapRouteById = new Map(amapRouteData.places.map((place) => [place.id, place]));
const amapLabelById = new Map(amapRouteData.places.map((place) => [place.id, place.label]));

function amapTravel(routeId) {
  const place = amapRouteById.get(routeId);
  return place ? `高德驾车 ${place.km} km · 约 ${place.minutes} 分钟` : "";
}

const allRoutes = [
  ...oldRoutes.map((route) => ({ ...route, ...(v5RouteOverrides[route.id] || {}) })),
  ...newRoutes
]
  .filter((route) => activeRouteIds.has(route.id))
  .map((route) => ({
    ...route,
    travel: amapTravel(route.id) || route.travel,
    score: route.rating.total
  }));
const rankedRoutes = [...allRoutes]
  .sort((left, right) => right.score - left.score)
  .map((route, index) => ({ ...route, rank: index + 1 }));
const rankedRouteById = new Map(rankedRoutes.map((route) => [route.id, route]));
const activeGroups = groups.filter((group) => allRoutes.some((route) => route.group === group.id));
const eligibleStayIds = new Set(
  allRoutes.flatMap((route) => routeStayIds[route.id] || [])
);
const allStays = [...oldStays, ...newStays]
  .filter((stay) => eligibleStayIds.has(stay.id));
const stayById = new Map(allStays.map((stay) => [stay.id, stay]));

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

function stayFitPriority(stay) {
  const fit = stay.fit || "";
  if (/不适合|不匹配/.test(fit)) return 3;
  if (/风险/.test(fit)) return 2;
  if (/待确认|待复核|冲突|非独栋|先问相邻/.test(fit)) return 1;
  return 0;
}

function getRouteStays(route) {
  return (routeStayIds[route.id] || [])
    .map((stayId) => stayById.get(stayId))
    .filter(Boolean)
    .sort((left, right) => stayFitPriority(left) - stayFitPriority(right));
}

function renderAmenityTags(stay, limit = 4) {
  return (stay.amenities || [])
    .slice(0, limit)
    .map((amenity) => `<span>${escapeHtml(amenity)}</span>`)
    .join("");
}

function renderStayReference(route, mode) {
  const stays = getRouteStays(route);
  if (!stays.length) return "";

  const visibleCount = mode === "dialog" ? stays.length : 1;
  const visibleStays = stays.slice(0, visibleCount);
  const remaining = stays.length - visibleStays.length;
  const isRow = mode === "row";
  const renderStayItem = (stay) => `
    <span class="stay-reference-item" data-image-frame>
      <img src="${escapeHtml(stay.photo)}" alt="" loading="lazy" decoding="async">
      <span class="stay-reference-copy">
        <strong>${escapeHtml(stay.name)}</strong>
        <span class="stay-reference-score">${escapeHtml(stay.rating)} · ${escapeHtml(stay.ratingLabel)}</span>
        <span class="stay-amenities">${renderAmenityTags(stay, isRow ? 3 : 4)}</span>
        <span class="stay-reference-fit">4间房适配：${escapeHtml(stay.fit)}</span>
      </span>
    </span>`;
  return `
    <span class="stay-reference stay-reference--${escapeHtml(mode)}">
      ${isRow ? "" : `
        <span class="stay-reference-heading">
          <strong>主推住宿</strong>
          <small>${stays.length === 1 ? "4 房适配单列" : `共 ${stays.length} 处候选 · 4 房适配单列`}</small>
        </span>`}
      <span class="stay-reference-list">
        ${visibleStays.map(renderStayItem).join("")}
      </span>
      ${remaining > 0 && !isRow ? `<span class="stay-reference-more">另 ${remaining} 处候选，点开路线看完整对比</span>` : ""}
    </span>`;
}

function renderStars(rating) {
  const width = Math.max(0, Math.min(5, Number(rating.stars) || 0)) / 5 * 100;
  return `
    <span class="stars" aria-label="${escapeHtml(rating.stars)}星">
      <span aria-hidden="true">★★★★★</span>
      <span class="stars-fill" style="width:${width}%" aria-hidden="true">★★★★★</span>
    </span>`;
}

function renderPlaceReviewMeta(route, mode) {
  const placeReview = route.placeReview;
  if (!placeReview?.items?.length) return "";

  const chips = placeReview.items.map((item) => {
    const score = item.score ? `<strong>${escapeHtml(item.score)}</strong>` : "";
    const detail = item.count || item.detail
      ? `<small>${escapeHtml(item.count || item.detail)}</small>`
      : "";
    return `<span class="place-review-chip">${escapeHtml(item.source)}${score}${detail}</span>`;
  }).join("");
  const note = mode !== "row" && placeReview.note
    ? `<span class="place-review-note">${escapeHtml(placeReview.note)}</span>`
    : "";

  return `
    <span class="place-review-meta place-review-meta--${escapeHtml(mode)}" aria-label="景点平台评价">
      <span class="place-review-label">景点评价</span>
      ${chips}
      ${note}
    </span>`;
}

function cleanRatingNote(value) {
  return String(value ?? "")
    .split(/(?<=[。！？])/u)
    .filter((sentence) => !/预算|人均|房费|房价|每晚|5000/.test(sentence))
    .join("")
    .trim();
}

function renderTimeline(rows) {
  return rows.map(([time, text]) => `
    <li>
      <time>${escapeHtml(time)}</time>
      <span>${escapeHtml(text)}</span>
    </li>`).join("");
}

function routeRegionLabel(route) {
  const areaParts = route.area.split(" · ");
  return areaParts.length > 1 ? areaParts.slice(0, -1).join(" · ") : route.area;
}

function renderRouteLauncher(route) {
  const rankedRoute = rankedRouteById.get(route.id);
  const regionLabel = routeRegionLabel(route);

  return `
    <article class="route-card" id="route-${escapeHtml(route.id)}">
      <button class="route-launcher" type="button" data-route-id="${escapeHtml(route.id)}"
        aria-haspopup="dialog" aria-controls="route-dialog-${escapeHtml(route.id)}">
        <span class="route-photo" data-image-frame>
          <img src="${escapeHtml(route.photo)}" alt="${escapeHtml(route.photoAlt)}" loading="lazy" decoding="async">
          <span class="region-pill">${escapeHtml(regionLabel)}</span>
          <span class="card-score">${escapeHtml(rankedRoute.score)}<small>分</small></span>
        </span>
        <span class="route-summary">
          <span class="route-kicker">
            <span>总榜第 ${escapeHtml(rankedRoute.rank)}</span>
            <span>${escapeHtml(route.travel)}</span>
          </span>
          <span class="route-title">${escapeHtml(route.title)}</span>
          ${renderPlaceReviewMeta(route, "card")}
          <span class="review-line"><strong>一句话口碑</strong>${escapeHtml(route.review)}</span>
          ${renderStayReference(route, "card")}
          <span class="fee-line"><strong>费用提醒</strong>${escapeHtml(route.fee)}</span>
          <span class="route-tags">${renderTags(route.tags)}</span>
          <span class="open-label">
            看评分和两天行程
            <span class="open-arrow" aria-hidden="true">→</span>
          </span>
        </span>
      </button>
    </article>`;
}

function renderRankRow(route) {
  const regionLabel = routeRegionLabel(route);
  const imageLoading = route.rank <= 2 ? "eager" : "lazy";
  const imagePriority = route.rank <= 2 ? "high" : "auto";
  return `
    <li>
      <button class="rank-row" type="button" data-route-id="${escapeHtml(route.id)}"
        aria-haspopup="dialog" aria-controls="route-dialog-${escapeHtml(route.id)}">
        <span class="row-head">
          <span class="row-visual" data-image-frame>
            <img class="row-photo" src="${escapeHtml(route.photo)}" alt="${escapeHtml(route.photoAlt)}"
              loading="${imageLoading}" fetchpriority="${imagePriority}" decoding="async">
            <span class="row-rank">${String(route.rank).padStart(2, "0")}</span>
          </span>
          <span class="row-main">
            <span class="row-meta">
              <span class="row-region">${escapeHtml(regionLabel)}</span>
              <span class="row-score">
                <span><b>${escapeHtml(route.score)}</b><small>分</small></span>
                ${renderStars(route.rating)}
              </span>
            </span>
            <strong>${escapeHtml(route.title)}</strong>
          </span>
          <span class="row-arrow" aria-hidden="true">›</span>
        </span>
        <span class="row-review">${escapeHtml(route.review)}</span>
        ${renderPlaceReviewMeta(route, "row")}
        ${renderStayReference(route, "row")}
        <span class="row-tags">${renderTags(route.tags)}</span>
      </button>
    </li>`;
}

function renderRouteDialog(route) {
  const rankedRoute = rankedRouteById.get(route.id);
  const rating = route.rating;
  const secondaryPhoto = route.photo2 ? `
    <figure class="detail-photo" data-image-frame>
      <img src="${escapeHtml(route.photo2)}" alt="${escapeHtml(route.photo2Alt)}" loading="lazy" decoding="async">
      <figcaption>${escapeHtml(route.photo2Caption)}</figcaption>
    </figure>` : "";
  const source = /^https?:\/\//.test(route.source) ? `
    <a class="source-link" href="${escapeHtml(route.source)}" target="_blank" rel="noreferrer">
      查看出行来源 <span aria-hidden="true">↗</span>
    </a>` : `<p class="source-note"><strong>资料复核</strong>${escapeHtml(route.source)}</p>`;
  const ratingNote = cleanRatingNote(rating.deductions);
  const ratingEvidence = rating.evidence
    ? `<p><strong>证据来源</strong>${escapeHtml(rating.evidence)}</p>`
    : `<p><strong>评价把握</strong>${escapeHtml(rating.confidence || "中偏低")}</p>`;

  return `
    <dialog class="route-dialog" id="route-dialog-${escapeHtml(route.id)}"
      aria-labelledby="route-dialog-title-${escapeHtml(route.id)}">
      <div class="dialog-bar">
        <span>总榜第 ${escapeHtml(rankedRoute.rank)} · ${escapeHtml(routeRegionLabel(route))}</span>
        <button class="dialog-close" type="button" data-close-dialog aria-label="关闭路线详情">关闭</button>
      </div>
      <div class="route-dialog-body">
        <div class="dialog-hero" data-image-frame>
          <img src="${escapeHtml(route.photo)}" alt="${escapeHtml(route.photoAlt)}" loading="lazy" decoding="async">
          <div class="dialog-hero-copy">
            <p class="dialog-region">${escapeHtml(routeRegionLabel(route))}</p>
            <h2 id="route-dialog-title-${escapeHtml(route.id)}">${escapeHtml(route.title)}</h2>
            <p class="dialog-travel">${escapeHtml(route.travel)}</p>
          </div>
        </div>
        <section class="score-panel" aria-label="路线评分">
          <div class="score-heading">
            <div>
              <strong>${escapeHtml(rating.total)}</strong><span>分</span>
            </div>
            ${renderStars(rating)}
          </div>
          <div class="score-parts">
            <span><b>${escapeHtml(rating.parts[0])}</b><small>白天体验 / 45</small></span>
            <span><b>${escapeHtml(rating.parts[1])}</b><small>内容组合 / 25</small></span>
            <span><b>${escapeHtml(rating.parts[2])}</b><small>省心程度 / 20</small></span>
            <span><b>${escapeHtml(rating.parts[3])}</b><small>证据质量 / 10</small></span>
          </div>
          <p class="score-reason">${escapeHtml(rating.reason)}</p>
          <details class="score-details">
            <summary>看扣分点和证据</summary>
            <div class="score-detail-copy">
              <p><strong>扣分点</strong>${escapeHtml(ratingNote || "公开信息仍有待现场复核的部分。")}</p>
              ${ratingEvidence}
            </div>
          </details>
          <p class="score-method">统一口径；住宿不参与路线评分。</p>
        </section>
        <section class="dialog-stay-section" aria-labelledby="dialog-stay-title-${escapeHtml(route.id)}">
          <div class="dialog-stay-heading">
            <h3 id="dialog-stay-title-${escapeHtml(route.id)}">住宿参考</h3>
            <p>${getRouteStays(route).length} 处就近候选；路线分只比玩法，住宿单独按多人设施和 4 房适配比较。</p>
          </div>
          <div class="dialog-stay-grid">
            ${getRouteStays(route).map((stay) => `
              <article class="dialog-stay-card" data-image-frame>
                <img src="${escapeHtml(stay.photo)}" alt="${escapeHtml(stay.photoAlt)}" loading="lazy" decoding="async">
                <div class="dialog-stay-body">
                  <div class="dialog-stay-title-row">
                    <h4>${escapeHtml(stay.name)}</h4>
                    <span>${escapeHtml(stay.rating)}</span>
                  </div>
                  <p class="dialog-stay-rating">${escapeHtml(stay.ratingLabel)}</p>
                  <div class="stay-amenities stay-amenities--dialog">${renderAmenityTags(stay, 8)}</div>
                  <p class="dialog-stay-review"><strong>一句话口碑</strong>${escapeHtml(stay.review)}</p>
                  <p class="dialog-stay-fit">4间房适配：${escapeHtml(stay.fit)}</p>
                  <p class="dialog-stay-confirm"><strong>订前先问</strong>${escapeHtml(stay.confirm)}</p>
                  <a href="${escapeHtml(stay.source)}" target="_blank" rel="noreferrer">${escapeHtml(stay.sourceLabel)} ↗</a>
                </div>
              </article>`).join("")}
          </div>
        </section>
        ${renderPlaceReviewMeta(route, "dialog")}
        <p class="review-line dialog-review"><strong>一句话口碑</strong>${escapeHtml(route.review)}</p>
        <p class="fee-line"><strong>费用提醒</strong>${escapeHtml(route.fee)}</p>
        <div class="activity-line">
          ${route.activities.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
        </div>
        <div class="route-detail">
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
          <div class="detail-footer">
            <p>${escapeHtml(route.photoCaption)}</p>
            ${source}
          </div>
        </div>
      </div>
    </dialog>`;
}

function renderStay(stay) {
  return `
    <article class="stay-card" data-image-frame>
      <img src="${escapeHtml(stay.photo)}" alt="${escapeHtml(stay.photoAlt)}" loading="lazy" decoding="async">
      <div class="stay-body">
        <div class="stay-heading">
          <h4>${escapeHtml(stay.name)}</h4>
          <span class="stay-score">${escapeHtml(stay.rating)}</span>
        </div>
        <p class="stay-rating">${escapeHtml(stay.ratingLabel)}</p>
        <div class="stay-amenities">${renderAmenityTags(stay, 8)}</div>
        <p class="stay-review"><strong>一句话口碑</strong>${escapeHtml(stay.review)}</p>
        <p class="stay-fit">4间房适配：${escapeHtml(stay.fit)}</p>
        <p class="stay-confirm"><strong>订前先问</strong>${escapeHtml(stay.confirm)}</p>
        <a class="stay-source" href="${escapeHtml(stay.source)}" target="_blank" rel="noreferrer">${escapeHtml(stay.sourceLabel)} ↗</a>
      </div>
    </article>`;
}

function renderRegionMap() {
  const routeIndex = activeGroups
    .map((group) => {
      const routes = rankedRoutes.filter((route) => route.group === group.id);
      return `
        <div class="map-index-group">
          <p><i class="map-group-dot map-group-dot--${escapeHtml(group.id)}"></i>${escapeHtml(group.title)}</p>
          ${routes.map((route) => `
            <a href="#route-${escapeHtml(route.id)}" data-route-id="${escapeHtml(route.id)}">
              <strong>${escapeHtml(amapLabelById.get(route.id) || route.id.replace(/^0/, ""))}</strong>
              <span>${escapeHtml(route.title)}<small>${escapeHtml(route.travel)}</small></span>
            </a>`).join("")}
        </div>`;
    }).join("");

  return `
    <section class="map-section" id="map" aria-labelledby="map-title">
      <header class="map-heading">
        <div>
          <p class="section-eyebrow">高德真实底图 · 陆家嘴出发</p>
          <h2 id="map-title">先看位置，再选路线</h2>
        </div>
        <p>底图和点位来自高德 POI/静态地图；绿色点是主游玩地，红色 S 是陆家嘴。车程来自高德距离测量，出发时仍以实时导航为准。</p>
      </header>
      <div class="map-frame" data-image-frame>
        <img class="region-map region-map-photo" src="assets/amap-route-map-v5.png"
          alt="高德实际地图底图：陆家嘴 S 为起点，${allRoutes.length} 个绿色点位对应下方路线索引" loading="lazy" decoding="async">
      </div>
      <div class="map-route-index" aria-label="路线地图索引">${routeIndex}</div>
      <div class="map-legend" aria-label="地图图例">
        <span><i class="legend-dot"></i>陆家嘴 S · 出发点</span>
        <span>绿色点是主游玩地，住宿放在对应路线里</span>
        <span>下方 A–N 打开对应路线</span>
      </div>
    </section>`;
}

const rankingBoard = `
  <section class="ranking-section" id="ranking" aria-labelledby="ranking-title">
    <header class="ranking-heading">
      <div>
        <p class="section-eyebrow">同一套标准比 ${allRoutes.length} 条</p>
        <h2 id="ranking-title">周末路线总榜</h2>
      </div>
      <p>白天体验 45 · 内容组合 25 · 省心程度 20 · 证据质量 10。住宿不参与加分。</p>
    </header>
    <ol class="rank-board">
      ${rankedRoutes.map(renderRankRow).join("")}
    </ol>
  </section>`;

const routeSections = activeGroups.map((group) => {
  const routes = rankedRoutes.filter((route) => route.group === group.id);
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
        ${routes.map(renderRouteLauncher).join("")}
      </div>
    </section>`;
}).join("");

const regionLinks = activeGroups.map((group) => `
  <a href="#region-${group.id}">${escapeHtml(group.title)}</a>`).join("");

const primaryTabs = `
  <div class="trip-tab-shell">
    <nav class="trip-tabs" role="tablist" aria-label="出行计划内容">
      <button class="trip-tab" id="tab-ranking" type="button" role="tab"
        aria-selected="true" aria-controls="panel-ranking" data-tab="ranking">总榜</button>
      <button class="trip-tab" id="tab-regions" type="button" role="tab"
        aria-selected="false" aria-controls="panel-regions" data-tab="regions" tabindex="-1">分区域</button>
      <button class="trip-tab" id="tab-map" type="button" role="tab"
        aria-selected="false" aria-controls="panel-map" data-tab="map" tabindex="-1">路线图</button>
    </nav>
  </div>`;

const routeCount = allRoutes.length;
const stayCount = allStays.length;
const routeDialogs = rankedRoutes.map(renderRouteDialog).join("");

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
      font-size: 20px;
      line-height: 1.72;
    }

    a { color: var(--green); text-underline-offset: 3px; }
    img { display: block; max-width: 100%; }
    p, h1, h2, h3, h4, figure, ol { margin: 0; }
    h1, h2, h3, h4 { line-height: 1.25; letter-spacing: 0; }

    @keyframes image-spin {
      to { transform: rotate(360deg); }
    }

    [data-image-frame] { position: relative; }
    [data-image-frame].image-pending::before {
      position: absolute;
      inset: 0;
      z-index: 1;
      background: #e6ece7;
      content: "";
      pointer-events: none;
    }
    [data-image-frame].image-pending::after {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 2;
      width: 24px;
      height: 24px;
      margin: -12px 0 0 -12px;
      border: 3px solid rgba(31, 85, 65, .18);
      border-top-color: var(--green);
      border-radius: 50%;
      animation: image-spin .8s linear infinite;
      content: "";
      pointer-events: none;
    }
    [data-image-frame].image-pending > img { opacity: .18; }
    img.image-loaded {
      opacity: 1;
      transition: opacity .22s ease;
    }

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

    .trip-tab-shell {
      width: min(1180px, calc(100% - 28px));
      margin: 0 auto;
      padding-bottom: 10px;
    }

    .trip-tabs {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 7px;
      padding: 6px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--surface);
      box-shadow: var(--shadow);
    }

    .trip-tab {
      min-width: 0;
      min-height: 52px;
      padding: 8px 10px;
      border: 1px solid transparent;
      border-radius: 6px;
      background: transparent;
      color: var(--ink);
      font: inherit;
      font-size: 18px;
      font-weight: 900;
      line-height: 1.35;
      cursor: pointer;
      touch-action: manipulation;
    }

    .trip-tab[aria-selected="true"] {
      border-color: var(--green);
      background: var(--green);
      color: white;
    }

    .trip-tab:focus-visible {
      outline: 3px solid #a9c8b6;
      outline-offset: 2px;
    }

    .tab-panel[hidden] { display: none; }
    .tab-panel:focus { outline: none; }

    .region-nav {
      display: flex;
      gap: 8px;
      margin-top: 10px;
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

    .region-panel-nav {
      width: min(1180px, calc(100% - 28px));
      margin: 0 auto;
      padding: 34px 0 4px;
    }

    .region-panel-nav > p {
      color: var(--rust);
      font-size: 16px;
      font-weight: 900;
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

    .section-eyebrow {
      color: var(--rust);
      font-size: 16px;
      font-weight: 900;
      line-height: 1.4;
    }

    .map-section,
    .ranking-section {
      padding: 44px max(14px, calc((100% - 1180px) / 2)) 56px;
      border-top: 1px solid var(--line);
    }

    .map-section { background: rgba(255, 253, 248, .52); }

    .map-heading,
    .ranking-heading {
      display: grid;
      gap: 10px;
      margin-bottom: 22px;
    }

    .map-heading h2,
    .ranking-heading h2 {
      margin-top: 3px;
      font-size: 38px;
      font-weight: 900;
    }

    .map-heading > p,
    .ranking-heading > p {
      max-width: 760px;
      color: var(--muted);
      font-size: 18px;
      line-height: 1.65;
    }

    .map-frame {
      overflow: hidden;
      overflow-y: hidden;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: #e8efe9;
      box-shadow: var(--shadow);
    }

    .region-map {
      display: block;
      width: 100%;
      min-width: 620px;
      height: 100%;
      margin-left: 50%;
      transform: translateX(-50%);
      object-fit: cover;
      object-position: center 50%;
    }

    .map-frame { height: clamp(260px, 30vw, 420px); }

    .map-background { fill: #edf2ec; }
    .map-grid path {
      fill: none;
      stroke: #d3ddd5;
      stroke-width: 1;
      stroke-dasharray: 3 7;
    }
    .map-frame-label {
      fill: var(--ink);
      font-size: 22px;
      font-weight: 900;
    }
    .map-coordinate-label {
      fill: var(--muted);
      font-size: 14px;
      font-weight: 700;
    }
    .map-link {
      stroke: #789285;
      stroke-width: 2.4;
      stroke-dasharray: 7 8;
    }
    .map-link--fengxian { stroke: #ad6a4e; }
    .map-link--pudong { stroke: #4e7d69; }
    .map-stop { color: var(--ink); text-decoration: none; }
    .map-stop circle {
      fill: #6b8175;
      stroke: #fffdf8;
      stroke-width: 3;
      filter: drop-shadow(0 2px 3px rgba(25, 42, 33, .22));
      transition: transform .2s ease, fill .2s ease;
      transform-box: fill-box;
      transform-origin: center;
    }
    .map-stop--fengxian circle { fill: var(--rust); }
    .map-stop--pudong circle { fill: var(--green); }
    .map-stop:hover circle,
    .map-stop:focus-visible circle { fill: var(--blue); transform: scale(1.14); }
    .map-stop:focus { outline: none; }
    .map-stop text {
      fill: white;
      font-size: 13px;
      font-weight: 900;
      pointer-events: none;
      text-anchor: middle;
    }
    .map-origin-halo { fill: var(--rust-soft); stroke: var(--rust); stroke-width: 2; }
    .map-origin-dot { fill: var(--rust); }
    .map-origin text {
      fill: var(--rust);
      font-size: 17px;
      font-weight: 900;
      text-anchor: middle;
    }

    .map-route-index {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-top: 14px;
    }
    .map-index-group {
      padding: 13px 14px 10px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--surface-strong);
    }
    .map-index-group > p {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-bottom: 8px;
      font-size: 17px;
      font-weight: 900;
    }
    .map-group-dot {
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: #6b8175;
    }
    .map-group-dot--fengxian { background: var(--rust); }
    .map-group-dot--pudong { background: var(--green); }
    .map-index-group a {
      display: grid;
      grid-template-columns: 34px minmax(0, 1fr);
      gap: 9px;
      align-items: start;
      min-height: 48px;
      padding: 9px 0;
      border-top: 1px solid #e5e9e5;
      color: var(--ink);
      text-decoration: none;
    }
    .map-index-group a:focus-visible { outline: 3px solid #a9c8b6; outline-offset: 3px; }
    .map-index-group a strong {
      display: grid;
      min-height: 30px;
      place-items: center;
      border-radius: 999px;
      background: var(--green-soft);
      color: var(--green);
      font-size: 15px;
      font-weight: 900;
    }
    .map-index-group a span { display: block; font-size: 16px; font-weight: 900; line-height: 1.45; }
    .map-index-group a small {
      display: block;
      margin-top: 2px;
      color: var(--blue);
      font-size: 14px;
      font-weight: 700;
      line-height: 1.5;
    }

    .map-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 18px;
      padding-top: 13px;
      color: var(--muted);
      font-size: 15px;
      font-weight: 700;
    }

    .map-legend span { display: inline-flex; align-items: center; gap: 7px; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--rust); }
    .legend-line { width: 24px; border-top: 2px dashed #7e9689; }

    .rank-board {
      display: grid;
      margin: 0;
      padding: 0;
      gap: 18px;
      list-style: none;
    }

    .rank-board li {
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--surface-strong);
      box-shadow: 0 10px 28px rgba(33, 50, 41, .07);
    }

    .rank-row {
      --thumb-col: 96px;
      --head-gap: 9px;
      --row-pad-x: 14px;
      display: grid;
      gap: 7px;
      width: 100%;
      padding: 12px var(--row-pad-x) 10px;
      border: 0;
      background: transparent;
      color: var(--ink);
      font: inherit;
      text-align: left;
      cursor: pointer;
      touch-action: manipulation;
    }

    .rank-row:hover { background: #f8f6ef; }
    .rank-row:focus-visible { outline: 3px solid #a9c8b6; outline-offset: -3px; }
    .row-head {
      display: grid;
      grid-template-columns: var(--thumb-col) minmax(0, 1fr) 16px;
      gap: var(--head-gap);
      align-items: start;
    }
    .row-visual {
      position: relative;
      width: var(--thumb-col);
      height: var(--thumb-col);
    }
    .row-rank {
      position: absolute;
      top: 5px;
      left: 5px;
      z-index: 1;
      padding: 1px 5px;
      border-radius: 999px;
      background: rgba(24, 34, 29, .82);
      color: white;
      font-size: 12px;
      font-weight: 900;
      line-height: 1.35;
      font-variant-numeric: tabular-nums;
    }
    .row-photo {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 6px;
      object-fit: cover;
      background: #dbe1dc;
    }
    .row-main {
      display: grid;
      min-width: 0;
      align-content: start;
      gap: 5px;
    }
    .row-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 8px;
      min-width: 0;
    }
    .row-region { color: var(--rust); font-size: 13px; font-weight: 900; }
    .row-main > strong { font-size: 20px; line-height: 1.26; }
    .row-review {
      display: -webkit-box;
      overflow: hidden;
      color: #46554d;
      font-size: 15px;
      line-height: 1.42;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
    .place-review-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px 8px;
      min-width: 0;
      margin-top: 12px;
      padding: 9px 10px;
      border: 1px solid #cfdad3;
      border-radius: 6px;
      background: #f7faf7;
      color: #31463b;
      font-size: 16px;
      line-height: 1.45;
    }
    .place-review-label {
      flex: 0 0 auto;
      color: var(--green);
      font-size: 14px;
      font-weight: 900;
    }
    .place-review-chip {
      display: inline-flex;
      align-items: baseline;
      gap: 4px;
      min-width: 0;
      padding: 2px 7px;
      border: 1px solid #d5e0d9;
      border-radius: 4px;
      background: var(--surface-strong);
      font-size: 15px;
      font-weight: 800;
      line-height: 1.45;
    }
    .place-review-chip strong {
      color: var(--ink);
      font-size: 18px;
      line-height: 1.2;
      font-variant-numeric: tabular-nums;
    }
    .place-review-chip small {
      color: var(--muted);
      font-size: 14px;
      font-weight: 700;
    }
    .place-review-note {
      flex-basis: 100%;
      color: #665a44;
      font-size: 14px;
      line-height: 1.45;
    }
    .place-review-meta--row {
      gap: 4px 5px;
      margin-top: 2px;
      padding: 4px 6px;
      border: 1px solid #d8e2dc;
      background: #f7faf7;
      font-size: 13px;
    }
    .place-review-meta--row .place-review-label { font-size: 12px; }
    .place-review-meta--row .place-review-chip { padding: 1px 5px; font-size: 13px; }
    .place-review-meta--row .place-review-chip strong { font-size: 14px; }
    .place-review-meta--row .place-review-chip small { font-size: 12px; }
    .place-review-meta--row .place-review-note { display: none; }
    .place-review-meta--dialog {
      margin: 0 16px;
      padding: 12px 13px;
      font-size: 17px;
    }
    .place-review-meta--dialog .place-review-label { font-size: 15px; }
    .place-review-meta--dialog .place-review-chip { padding: 3px 8px; font-size: 16px; }
    .place-review-meta--dialog .place-review-chip strong { font-size: 19px; }
    .place-review-meta--dialog .place-review-chip small,
    .place-review-meta--dialog .place-review-note { font-size: 15px; }
    .row-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .row-tags span {
      padding: 1px 6px;
      border-radius: 999px;
      background: var(--green-soft);
      color: var(--green);
      font-size: 12px;
      font-weight: 800;
      line-height: 1.45;
    }
    .row-score {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 5px 8px;
      color: var(--ink);
    }
    .row-score > span:first-child { white-space: nowrap; }
    .row-score b { font-size: 21px; line-height: 1; font-variant-numeric: tabular-nums; }
    .row-score small { margin-left: 2px; color: var(--muted); font-size: 11px; font-weight: 800; }
    .rank-row .stars { font-size: 14px; }
    .row-arrow { align-self: center; color: #75867c; font-size: 20px; line-height: 1; }

    .stars {
      position: relative;
      display: inline-block;
      flex: 0 0 auto;
      color: #d8d2c5;
      font-size: 17px;
      font-weight: 800;
      line-height: 1.2;
      letter-spacing: 0;
      white-space: nowrap;
    }
    .stars-fill {
      position: absolute;
      inset: 0 auto 0 0;
      overflow: hidden;
      color: var(--gold);
      white-space: nowrap;
    }

    .route-launcher {
      display: block;
      width: 100%;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--ink);
      font: inherit;
      text-align: left;
      cursor: pointer;
      touch-action: manipulation;
    }
    .route-launcher:focus-visible { outline: 3px solid #89ad98; outline-offset: -3px; }
    .route-card:hover .route-photo img { transform: scale(1.025); }

    .card-score {
      position: absolute;
      top: 12px;
      right: 12px;
      display: inline-flex;
      align-items: baseline;
      gap: 2px;
      padding: 4px 9px;
      border-radius: 999px;
      background: rgba(164, 79, 50, .94);
      color: white;
      font-size: 21px;
      font-weight: 900;
      line-height: 1.35;
      font-variant-numeric: tabular-nums;
    }
    .card-score small { font-size: 12px; font-weight: 800; }
    .route-title { display: block; margin-top: 10px; font-size: 29px; font-weight: 900; line-height: 1.25; }

    .stay-reference {
      display: block;
      margin-top: 14px;
      padding: 12px;
      border: 1px solid #cedbd3;
      border-radius: 8px;
      background: #f7faf7;
      text-align: left;
    }
    .stay-reference-heading {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: 3px 10px;
    }
    .stay-reference-heading strong {
      color: var(--green);
      font-size: 17px;
      line-height: 1.4;
    }
    .stay-reference-heading small {
      color: var(--muted);
      font-size: 13px;
      font-weight: 700;
      line-height: 1.45;
    }
    .stay-reference-list { display: grid; margin-top: 7px; }
    .stay-reference-item {
      display: grid;
      grid-template-columns: 64px minmax(0, 1fr);
      gap: 10px;
      align-items: start;
      padding: 10px 0;
      border-top: 1px solid #e0e7e2;
    }
    .stay-reference-item:first-child { border-top: 0; padding-top: 4px; }
    .stay-reference-item img {
      width: 64px;
      height: 64px;
      border-radius: 6px;
      object-fit: cover;
      background: #d8e1db;
    }
    .stay-reference-copy {
      display: grid;
      gap: 3px;
      min-width: 0;
    }
    .stay-reference-copy > strong { font-size: 17px; line-height: 1.4; }
    .stay-reference-score {
      color: var(--muted);
      font-size: 14px;
      font-weight: 800;
      line-height: 1.45;
    }
    .stay-reference-fit {
      color: #23565e;
      font-size: 14px;
      font-weight: 800;
      line-height: 1.5;
    }
    .stay-reference-more {
      display: block;
      margin-top: 4px;
      color: var(--blue);
      font-size: 14px;
      font-weight: 800;
      line-height: 1.5;
    }
    .stay-amenities {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 3px;
    }
    .stay-amenities span {
      padding: 2px 7px;
      border-radius: 999px;
      background: var(--green-soft);
      color: var(--green);
      font-size: 13px;
      font-weight: 800;
      line-height: 1.5;
    }
    .stay-reference--row {
      margin: 1px calc(var(--row-pad-x) * -1) 0;
      padding: 9px var(--row-pad-x) 10px;
      border-right: 0;
      border-left: 0;
      border-radius: 0;
      box-shadow: none;
    }
    .stay-reference--row .stay-reference-list { margin-top: 0; }
    .stay-reference--row .stay-reference-item {
      grid-template-columns: 64px minmax(0, 1fr);
      gap: 9px;
      padding: 0;
      border: 0;
    }
    .stay-reference--row .stay-reference-item img { width: 64px; height: 64px; }
    .stay-reference--row .stay-reference-copy { gap: 2px; }
    .stay-reference--row .stay-reference-copy > strong { font-size: 15px; line-height: 1.32; }
    .stay-reference--row .stay-reference-score,
    .stay-reference--row .stay-reference-fit { font-size: 12px; line-height: 1.35; }
    .stay-reference--row .stay-amenities { gap: 3px; margin-top: 1px; }
    .stay-reference--row .stay-amenities span {
      padding: 1px 5px;
      font-size: 11px;
      line-height: 1.4;
    }
    .stay-reference--row .stay-reference-fit {
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    body.dialog-open { overflow: hidden; }

    .route-dialog {
      width: min(880px, calc(100% - 16px));
      max-width: none;
      max-height: calc(100dvh - 16px);
      margin: auto;
      padding: 0;
      overflow: hidden;
      border: 1px solid #bdc7bf;
      border-radius: var(--radius);
      background: var(--surface);
      color: var(--ink);
      box-shadow: 0 24px 80px rgba(20, 30, 24, .32);
    }

    .route-dialog::backdrop { background: rgba(22, 30, 26, .68); backdrop-filter: blur(2px); }

    .dialog-bar {
      position: sticky;
      top: 0;
      z-index: 3;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-height: 44px;
      padding: 4px 8px 4px 12px;
      border-bottom: 1px solid var(--line);
      background: rgba(255, 253, 248, .97);
      backdrop-filter: blur(12px);
      color: var(--muted);
      font-size: 14px;
      font-weight: 800;
    }

    .dialog-close {
      min-width: 52px;
      min-height: 34px;
      padding: 5px 11px;
      border: 1px solid #b9c4bc;
      border-radius: var(--radius);
      background: var(--surface-strong);
      color: var(--ink);
      font: inherit;
      font-size: 14px;
      font-weight: 900;
      cursor: pointer;
    }
    .dialog-close:focus-visible { outline: 3px solid #89ad98; outline-offset: 2px; }

    .route-dialog-body {
      max-height: calc(100dvh - 66px);
      overflow-y: auto;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }

    .dialog-hero { position: relative; min-height: 190px; background: #cfd8d0; }
    .dialog-hero > img { width: 100%; height: 190px; object-fit: cover; }
    .dialog-hero-copy {
      position: absolute;
      inset: auto 0 0;
      padding: 48px 13px 11px;
      background: linear-gradient(transparent, rgba(22, 31, 26, .92));
      color: white;
    }
    .dialog-region { font-size: 13px; font-weight: 900; }
    .dialog-hero h2 { margin-top: 3px; font-size: 23px; font-weight: 900; }
    .dialog-travel { margin-top: 5px; color: #eef1ed; font-size: 13px; line-height: 1.45; }

    .score-panel {
      margin: 10px;
      padding: 10px;
      border: 1px solid #c7d5cb;
      border-radius: var(--radius);
      background: var(--green-soft);
    }
    .score-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
    .score-heading > div { display: flex; align-items: baseline; }
    .score-heading > div strong { color: var(--green); font-size: 31px; font-weight: 900; line-height: 1; }
    .score-heading > div span { margin-left: 3px; color: var(--muted); font-size: 13px; font-weight: 800; }
    .score-heading .stars { font-size: 17px; }
    .score-parts {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 4px;
      margin-top: 8px;
    }
    .score-parts > span {
      display: grid;
      padding: 5px 4px;
      border-radius: 6px;
      background: var(--surface-strong);
      text-align: center;
    }
    .score-parts b { color: var(--green); font-size: 16px; line-height: 1.2; }
    .score-parts small { color: var(--muted); font-size: 10px; font-weight: 700; line-height: 1.3; }
    .score-reason { margin-top: 8px; font-size: 13px; line-height: 1.5; }

    .score-details {
      margin-top: 8px;
      border-top: 1px solid #bdd0c2;
    }
    .score-details summary {
      display: flex;
      align-items: center;
      min-height: 36px;
      color: var(--blue);
      font-size: 14px;
      font-weight: 900;
      cursor: pointer;
      list-style: none;
    }
    .score-details summary::-webkit-details-marker { display: none; }
    .score-details summary::after { content: "＋"; margin-left: 7px; }
    .score-details[open] summary::after { content: "－"; }
    .score-detail-copy {
      padding: 9px 10px;
      border-radius: 6px;
      background: rgba(255, 255, 255, .72);
    }
    .score-detail-copy p { font-size: 14px; line-height: 1.55; }
    .score-detail-copy p + p { margin-top: 8px; }
    .score-detail-copy strong,
    .source-note strong { display: block; color: var(--green); font-size: 12px; }
    .score-method { margin-top: 8px; color: var(--muted); font-size: 12px; }

    .dialog-stay-section {
      margin: 10px;
      padding: 10px;
      border: 1px solid #cfd9d2;
      border-radius: var(--radius);
      background: #f8f7f1;
    }
    .dialog-stay-heading h3 { font-size: 20px; }
    .dialog-stay-heading p { margin-top: 2px; color: var(--muted); font-size: 12px; line-height: 1.45; }
    .dialog-stay-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-top: 10px; }
    .dialog-stay-card {
      overflow: hidden;
      border: 1px solid #d2d9d4;
      border-radius: 8px;
      background: var(--surface-strong);
    }
    .dialog-stay-card > img {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 6.8;
      object-fit: cover;
      background: #d8e1db;
    }
    .dialog-stay-body { padding: 9px 10px 10px; }
    .dialog-stay-title-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      align-items: start;
    }
    .dialog-stay-title-row h4 { font-size: 16px; line-height: 1.32; }
    .dialog-stay-title-row span {
      padding: 2px 7px;
      border-radius: 6px;
      background: var(--rust-soft);
      color: var(--rust);
      font-size: 13px;
      font-weight: 900;
      white-space: nowrap;
    }
    .dialog-stay-rating { margin-top: 1px; color: var(--muted); font-size: 12px; }
    .stay-amenities--dialog { margin-top: 6px; }
    .dialog-stay-review,
    .dialog-stay-confirm,
    .dialog-stay-fit { margin-top: 6px; font-size: 13px; line-height: 1.48; }
    .dialog-stay-review strong,
    .dialog-stay-confirm strong {
      display: block;
      color: var(--green);
      font-size: 12px;
    }
    .dialog-stay-fit {
      padding: 6px 8px;
      border-radius: 6px;
      background: var(--blue-soft);
      color: #23565e;
      font-weight: 800;
    }
    .dialog-stay-confirm {
      padding: 7px 8px;
      border-radius: 6px;
      background: var(--gold-soft);
    }
    .dialog-stay-confirm strong { color: #79511a; }
    .dialog-stay-body > a {
      display: inline-flex;
      align-items: center;
      min-height: 34px;
      margin-top: 5px;
      font-size: 12px;
      font-weight: 800;
    }

    .route-dialog > .route-dialog-body > .review-line,
    .route-dialog > .route-dialog-body > .fee-line,
    .route-dialog > .route-dialog-body > .activity-line { margin-left: 10px; margin-right: 10px; }
    .route-dialog > .route-dialog-body > .activity-line { padding-top: 0; }
    .route-dialog .route-detail {
      padding: 0 10px 12px;
      border-top: 0;
      background: transparent;
    }

    .place-review-meta--dialog {
      margin: 0 10px;
      padding: 8px 10px;
      font-size: 14px;
    }
    .place-review-meta--dialog .place-review-label { font-size: 12px; }
    .place-review-meta--dialog .place-review-chip { padding: 2px 6px; font-size: 13px; }
    .place-review-meta--dialog .place-review-chip strong { font-size: 15px; }
    .place-review-meta--dialog .place-review-chip small,
    .place-review-meta--dialog .place-review-note { font-size: 12px; }

    .route-dialog .review-line,
    .route-dialog .fee-line {
      margin-top: 8px;
      padding-left: 10px;
      font-size: 13px;
      line-height: 1.5;
    }
    .route-dialog .review-line strong,
    .route-dialog .fee-line strong { font-size: 12px; }
    .route-dialog .fee-line { padding: 8px 10px; }

    .route-dialog .activity-line { gap: 6px; padding: 8px 0 12px; }
    .route-dialog .activity-line span { padding: 4px 7px; font-size: 12px; }

    .route-dialog .days-grid { gap: 10px; }
    .route-dialog .days-grid section { padding: 10px; }
    .route-dialog .days-grid h4 { font-size: 16px; }

    .source-note { margin-top: 10px; font-size: 15px; line-height: 1.6; }

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
      display: block;
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
      display: block;
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
      display: block;
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
      position: relative;
      margin-top: 10px;
      padding: 0 0 0 20px;
      list-style: none;
    }

    .timeline::before {
      position: absolute;
      top: 8px;
      bottom: 8px;
      left: 4px;
      width: 2px;
      border-radius: 999px;
      background: #c9d7ce;
      content: "";
    }

    .timeline li {
      position: relative;
      display: grid;
      grid-template-columns: max-content minmax(0, 1fr);
      gap: 8px;
      padding: 7px 0;
      border-top: 0;
      font-size: 14px;
      line-height: 1.48;
    }

    .timeline li::before {
      position: absolute;
      top: 13px;
      left: -16px;
      width: 8px;
      height: 8px;
      border: 2px solid var(--surface-strong);
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 0 1px #c9d7ce;
      content: "";
    }
    .timeline time {
      color: var(--rust);
      font-size: 12px;
      font-weight: 800;
      line-height: 1.4;
      white-space: nowrap;
    }

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
      .region-nav a { font-size: 18px; }
      .trip-tab-shell { width: min(1180px, calc(100% - 48px)); padding-bottom: 16px; }
      .trip-tab { min-height: 58px; font-size: 20px; }
      .region-panel-nav { width: min(1180px, calc(100% - 48px)); padding-top: 44px; }
      .region-panel-nav > p { font-size: 17px; }
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
      .timeline li { grid-template-columns: max-content minmax(0, 1fr); font-size: 15px; }
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

    @media (min-width: 720px) {
      body { font-size: 21px; }
      .map-section,
      .ranking-section { padding-top: 58px; padding-bottom: 70px; }
      .map-heading,
      .ranking-heading { grid-template-columns: 1fr 1fr; align-items: end; gap: 28px; }
      .map-heading h2,
      .ranking-heading h2 { font-size: 48px; }
      .map-heading > p,
      .ranking-heading > p { font-size: 19px; }
      .section-eyebrow { font-size: 17px; }
      .region-map { min-width: 0; }
      .map-route-index { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .map-legend { font-size: 16px; }
      .rank-row {
        --thumb-col: 112px;
        --head-gap: 14px;
        --row-pad-x: 18px;
        align-items: center;
        gap: 9px;
        padding: 14px var(--row-pad-x) 12px;
      }
      .row-head { grid-template-columns: var(--thumb-col) minmax(0, 1fr) 18px; }
      .row-rank { font-size: 13px; }
      .row-main { gap: 6px; }
      .row-region { font-size: 14px; }
      .row-main > strong { font-size: 22px; }
      .row-review { font-size: 16px; -webkit-line-clamp: 2; }
      .place-review-meta { font-size: 17px; }
      .place-review-chip { font-size: 16px; }
      .place-review-chip strong { font-size: 19px; }
      .place-review-chip small,
      .place-review-note { font-size: 15px; }
      .place-review-meta--row { font-size: 14px; }
      .place-review-meta--row .place-review-label { font-size: 13px; }
      .place-review-meta--row .place-review-chip { font-size: 14px; }
      .place-review-meta--row .place-review-chip strong { font-size: 15px; }
      .place-review-meta--row .place-review-chip small { font-size: 13px; }
      .place-review-meta--dialog {
        margin-left: 22px;
        margin-right: 22px;
      }
      .row-tags span { padding: 1px 7px; font-size: 13px; }
      .row-score { justify-content: flex-start; gap: 7px; }
      .row-score b { font-size: 23px; }
      .rank-row .stars { font-size: 15px; }
      .row-arrow { font-size: 24px; }
      .stay-reference--row .stay-reference-item {
        grid-template-columns: 72px minmax(0, 1fr);
        gap: 10px;
      }
      .stay-reference--row .stay-reference-item img { width: 72px; height: 72px; }
      .route-title { font-size: 32px; }
      .review-line,
      .fee-line { font-size: 19px; }
      .dialog-bar { padding-left: 16px; }
      .dialog-hero,
      .dialog-hero > img { height: 300px; }
      .dialog-hero-copy { padding: 72px 18px 18px; }
      .dialog-region { font-size: 14px; }
      .dialog-hero h2 { font-size: 30px; }
      .dialog-travel { font-size: 14px; }
      .score-panel { margin: 14px; padding: 14px; }
      .score-parts { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .score-reason { font-size: 15px; }
      .score-detail-copy p { font-size: 14px; }
      .dialog-stay-section { margin: 14px; padding: 14px; }
      .dialog-stay-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .dialog-stay-heading h3 { font-size: 23px; }
      .dialog-stay-heading p { font-size: 14px; }
      .dialog-stay-title-row h4 { font-size: 18px; }
      .dialog-stay-review,
      .dialog-stay-confirm,
      .dialog-stay-fit { font-size: 14px; }
      .route-dialog > .route-dialog-body > .review-line,
      .route-dialog > .route-dialog-body > .fee-line,
      .route-dialog > .route-dialog-body > .activity-line { margin-left: 14px; margin-right: 14px; }
      .route-dialog .route-detail { padding: 0 14px 18px; }
      .stay-rating { font-size: 16px; }
      .stay-review,
      .stay-confirm { font-size: 19px; }
      .stay-fit { font-size: 17px; }
      .page-note p { font-size: 17px; }
    }

    @media (max-width: 719px) {
      .intro { padding-top: 34px; }
      .intro h1 { font-size: 46px; }
      .intro-lead { font-size: 20px; }
      .trip-tab { font-size: 19px; }
      .map-heading h2,
      .ranking-heading h2,
      .region-heading h2 { font-size: 36px; }
      .map-heading > p,
      .ranking-heading > p,
      .region-intro { font-size: 18px; }
      .map-frame { margin-right: -1px; }
      .rank-row {
        --thumb-col: 96px;
        --head-gap: 9px;
        --row-pad-x: 12px;
        gap: 7px;
        min-height: 0;
        padding: 12px var(--row-pad-x) 10px;
        align-items: start;
      }
      .row-head { grid-template-columns: var(--thumb-col) minmax(0, 1fr) 16px; }
      .row-rank { padding: 1px 5px; font-size: 12px; }
      .row-photo { width: var(--thumb-col); height: var(--thumb-col); }
      .row-main { display: grid; gap: 5px; }
      .row-meta { gap: 4px 8px; }
      .row-region { font-size: 13px; }
      .row-main > strong { font-size: 20px; line-height: 1.26; }
      .row-review {
        font-size: 15px;
        line-height: 1.42;
        -webkit-line-clamp: 2;
      }
      .place-review-meta--row {
        margin-top: 2px;
        padding: 4px 6px;
        border: 1px solid #cfdad3;
        background: #f7faf7;
      }
      .stay-reference--row {
        margin-top: 0;
        margin-right: calc(var(--row-pad-x) * -1);
        margin-left: calc(var(--row-pad-x) * -1);
        padding: 9px var(--row-pad-x) 10px;
      }
      .stay-reference--row .stay-reference-item {
        grid-template-columns: 64px minmax(0, 1fr);
        gap: 9px;
      }
      .stay-reference--row .stay-reference-item img { width: 64px; height: 64px; }
      .stay-reference--row .stay-reference-copy > strong { font-size: 15px; }
      .stay-reference--row .stay-reference-score,
      .stay-reference--row .stay-reference-fit,
      .stay-reference--row .stay-reference-more { font-size: 12px; }
      .stay-reference--row .stay-amenities span { font-size: 11px; }
      .row-score {
        justify-content: flex-start;
        gap: 5px 9px;
      }
      .row-score b { font-size: 21px; }
      .rank-row .stars { font-size: 14px; }
      .row-arrow { align-self: center; font-size: 20px; }
      .row-tags { margin-top: 1px; }
      .route-title { font-size: 28px; }
      .dialog-hero { min-height: 190px; }
      .dialog-hero > img { height: 190px; }
      .dialog-hero h2 { font-size: 23px; }
      .score-parts > span { min-height: 46px; }
      .stay-heading h4 { font-size: 24px; }
      .stay-rating { font-size: 16px; }
      .stay-review,
      .stay-confirm { font-size: 18px; }
      .stay-fit { font-size: 16px; }
    }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      *, *::before, *::after { transition: none !important; }
    }
  </style>
</head>
<body>
  <a class="skip-link" href="#main">跳到路线</a>

  <main id="main">
    <section class="intro" aria-labelledby="page-title">
      <p class="intro-label">两天一夜 · 玩优先</p>
      <h1 id="page-title">出行计划</h1>
      <p class="intro-lead">
        <strong>${routeCount} 条玩法路线</strong>，住宿直接跟着对应玩法走。先看白天怎么玩，再在路线里挑 4 房适配和多人设施。
      </p>
    </section>

    ${primaryTabs}

    <section class="tab-panel" id="panel-ranking" role="tabpanel"
      aria-labelledby="tab-ranking" tabindex="0">
      ${rankingBoard}
    </section>

    <section class="tab-panel" id="panel-regions" role="tabpanel"
      aria-labelledby="tab-regions" tabindex="0" hidden>
      <div class="region-panel-nav">
        <p>按区域看路线</p>
        <nav class="region-nav" aria-label="路线地区">
          ${regionLinks}
        </nav>
      </div>
      ${routeSections}
    </section>

    <section class="tab-panel" id="panel-map" role="tabpanel"
      aria-labelledby="tab-map" tabindex="0" hidden>
      ${renderRegionMap()}
    </section>

  </main>

  ${routeDialogs}

  <footer class="page-note">
    <div class="page-note-inner">
      <p>资料复核：携程问道、美团旅行 CLI、高德 MCP。车程均从陆家嘴出发，按本次高德路线规划记录；票价、开放时间、船班和现场收费会变，出发前再查官方渠道。</p>
    </div>
  </footer>
  <script>
    (() => {
      const closeDialog = (dialog) => {
        if (dialog?.open) dialog.close();
      };

      const tabs = [...document.querySelectorAll('[role="tab"]')];
      const panels = [...document.querySelectorAll('[role="tabpanel"]')];

      document.querySelectorAll("[data-image-frame]").forEach((frame) => {
        const image = frame.querySelector("img");
        if (!image) return;
        const finishLoading = () => {
          image.classList.add("image-loaded");
          frame.classList.remove("image-pending");
        };
        const failLoading = () => {
          image.classList.add("image-error");
          frame.classList.remove("image-pending");
        };

        if (image.complete) {
          if (image.naturalWidth > 0) finishLoading();
          else failLoading();
          return;
        }

        frame.classList.add("image-pending");
        image.addEventListener("load", finishLoading, { once: true });
        image.addEventListener("error", failLoading, { once: true });
      });

      const activateTab = (nextTab, shouldFocus = false) => {
        tabs.forEach((tab) => {
          const selected = tab === nextTab;
          tab.setAttribute("aria-selected", String(selected));
          tab.tabIndex = selected ? 0 : -1;
        });
        panels.forEach((panel) => {
          panel.hidden = panel.id !== nextTab.getAttribute("aria-controls");
        });
        if (shouldFocus) nextTab.focus();
      };

      tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => activateTab(tab));
        tab.addEventListener("keydown", (event) => {
          let nextIndex = index;
          if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
          else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
          else if (event.key === "Home") nextIndex = 0;
          else if (event.key === "End") nextIndex = tabs.length - 1;
          else return;
          event.preventDefault();
          activateTab(tabs[nextIndex], true);
        });
      });

      document.addEventListener("click", (event) => {
        const opener = event.target.closest("[data-route-id]");
        if (opener) {
          event.preventDefault();
          const dialog = document.getElementById("route-dialog-" + opener.dataset.routeId);
          if (dialog && !dialog.open) {
            document.body.classList.add("dialog-open");
            dialog.showModal();
          }
          return;
        }

        const closeButton = event.target.closest("[data-close-dialog]");
        if (closeButton) {
          closeDialog(closeButton.closest("dialog"));
          return;
        }

        const dialog = event.target.closest("dialog.route-dialog");
        if (dialog && event.target === dialog) closeDialog(dialog);
      });

      document.querySelectorAll("dialog.route-dialog").forEach((dialog) => {
        dialog.addEventListener("close", () => {
          if (!document.querySelector("dialog.route-dialog[open]")) {
            document.body.classList.remove("dialog-open");
          }
        });
        dialog.addEventListener("click", (event) => {
          const rect = dialog.getBoundingClientRect();
          const outside =
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom;
          if (outside) closeDialog(dialog);
        });
        dialog.addEventListener("toggle", (event) => {
          if (event.newState === "open") {
            document.body.classList.add("dialog-open");
          } else if (!document.querySelector("dialog.route-dialog[open]")) {
            document.body.classList.remove("dialog-open");
          }
        });
      });
    })();
  </script>
</body>
</html>
`;

fs.writeFileSync(outputPath, html.replace(/[ \t]+$/gm, ""), "utf8");
console.log(`Wrote ${path.basename(outputPath)}`);
console.log(`Routes: ${routeCount}; stays: ${stayCount}`);
