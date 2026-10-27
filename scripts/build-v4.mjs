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
    travel: "高德驾车 59.9 km · 约 110 分钟"
  },
  "02": {
    group: "qingpu",
    fee: "帆船要预约，6 人票价和天气退改先问；金泽免大门票，游船现场问价。",
    travel: "高德驾车 淀山湖 57.4 km · 约 110 分钟；金泽 65.8 km · 约 109 分钟"
  },
  "03": {
    group: "qingpu",
    fee: "古镇免费；3 景点联票约 45–55 元；游船 200–300 元/船，最多 6 人。",
    travel: "高德驾车 51.3 km · 约 98 分钟"
  },
  "11": {
    group: "qingpu",
    fee: "公园免费；电瓶车 20 元/人；水上森林 16:00 停止进入，游船收费先问。",
    travel: "高德驾车 59.2 km · 约 107 分钟"
  },
  "16": {
    group: "qingpu",
    fee: "门票 45 元起，观光车 40 元/人；园内项目另收费，最晚 16:00 入园。",
    travel: "高德驾车 52.8 km · 约 102 分钟"
  },
  "04": {
    group: "jinshan",
    fee: "老街免费；展馆联票约 40 元、单馆 10 元；海边步道免费，停车现场确认。",
    travel: "高德驾车 81.7 km · 约 115 分钟"
  },
  "05": {
    group: "jinshan",
    fee: "古镇免费；场馆通票约 42 元；手摇船约 40 分钟，票价现场问。",
    travel: "高德驾车 73.4 km · 约 115 分钟"
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
    travel: "高德驾车 35.5 km · 约 84 分钟"
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
    travel: "高德驾车 33.2 km · 约 74 分钟"
  },
  "17": {
    group: "pudong",
    fee: "老街免费；轮渡 15 元/人；比斯特消费满 50 元可兑 5 小时免费停车。",
    travel: "高德驾车 川沙 27.2 km · 约 65 分钟；比斯特 28.3 km · 约 56 分钟"
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
    eyebrow: "手作 · 庭院 · 慢逛",
    title: "奉贤",
    intro: "只保留车程更短的玩法，适合做手作、在庭院待着，不赶景点。"
  },
  {
    id: "pudong",
    eyebrow: "古镇 · 逛吃 · 顺路",
    title: "浦东",
    intro: "新场和川沙都在 90 分钟圈内，古镇逛吃和第二天顺路安排最稳。"
  },
  {
    id: "suzhou",
    eyebrow: "锦溪 · 周庄 · 太湖西山",
    title: "苏州跨城",
    intro: "这三条车程更长，适合整趟只为一条路线去；住宿按就近和多人玩法单独比较。"
  }
];

const routeStayIds = {
  "01": ["sun", "new_fusheng"],
  "02": ["sun", "new_fusheng"],
  "03": ["new_fusheng", "sun"],
  "04": ["hanqi", "new_guiyuan"],
  "05": ["hanqi", "new_guiyuan"],
  "06": ["hanqi", "new_guiyuan"],
  "08": ["sangu", "new_shuyuan", "new_xianshe"],
  "09": ["new_daojia", "banxia"],
  "11": ["new_fusheng", "sun"],
  "12": ["banxia", "new_daojia"],
  "13": ["new_daojia", "banxia"],
  "14": ["new_nongshe", "new_xianshe"],
  "15": ["new_guiyuan", "hanqi"],
  "16": ["sun", "new_fusheng"],
  "17": ["new_xianshe", "new_nongshe"],
  s01: ["chengyu"],
  s02: ["miyi"],
  s03: ["xishan"]
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

const maxDriveMinutes = 90;
const eligibleRouteIds = new Set(["12", "14", "17"]);

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

const allRoutes = [...oldRoutes, ...newRoutes]
  .filter((route) => eligibleRouteIds.has(route.id))
  .map((route) => ({ ...route, score: route.rating.total }));
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

function getRouteStays(route) {
  return (routeStayIds[route.id] || [])
    .map((stayId) => stayById.get(stayId))
    .filter(Boolean);
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

  const visibleCount = mode === "dialog" ? stays.length : mode === "row" ? 1 : 2;
  const visibleStays = stays.slice(0, visibleCount);
  const remaining = stays.length - visibleStays.length;
  return `
    <span class="stay-reference stay-reference--${escapeHtml(mode)}">
      <span class="stay-reference-heading">
        <strong>住宿参考</strong>
        <small>${stays.length} 处候选 · 4 房适配单列</small>
      </span>
      <span class="stay-reference-list">
        ${visibleStays.map((stay) => `
          <span class="stay-reference-item">
            <img src="${escapeHtml(stay.photo)}" alt="" loading="lazy">
            <span class="stay-reference-copy">
              <strong>${escapeHtml(stay.name)}</strong>
              <span class="stay-reference-score">${escapeHtml(stay.rating)} · ${escapeHtml(stay.ratingLabel)}</span>
              <span class="stay-amenities">${renderAmenityTags(stay, 4)}</span>
              <span class="stay-reference-fit">4间房适配：${escapeHtml(stay.fit)}</span>
            </span>
          </span>`).join("")}
      </span>
      ${remaining > 0 ? `<span class="stay-reference-more">另 ${remaining} 处候选，点开路线看完整对比</span>` : ""}
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
        <span class="route-photo">
          <img src="${escapeHtml(route.photo)}" alt="${escapeHtml(route.photoAlt)}" loading="lazy">
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
  return `
    <li>
      <button class="rank-row" type="button" data-route-id="${escapeHtml(route.id)}"
        aria-haspopup="dialog" aria-controls="route-dialog-${escapeHtml(route.id)}">
        <span class="row-rank">${String(route.rank).padStart(2, "0")}</span>
        <img class="row-photo" src="${escapeHtml(route.photo)}" alt="${escapeHtml(route.photoAlt)}" loading="lazy">
        <span class="row-main">
          <span class="row-region">${escapeHtml(regionLabel)}</span>
          <strong>${escapeHtml(route.title)}</strong>
          <span class="row-review">${escapeHtml(route.review)}</span>
          ${renderPlaceReviewMeta(route, "row")}
          ${renderStayReference(route, "row")}
          <span class="row-tags">${renderTags(route.tags)}</span>
        </span>
        <span class="row-score">
          <span><b>${escapeHtml(route.score)}</b><small>分</small></span>
          ${renderStars(route.rating)}
        </span>
        <span class="row-arrow" aria-hidden="true">›</span>
      </button>
    </li>`;
}

function renderRouteDialog(route) {
  const rankedRoute = rankedRouteById.get(route.id);
  const rating = route.rating;
  const secondaryPhoto = route.photo2 ? `
    <figure class="detail-photo">
      <img src="${escapeHtml(route.photo2)}" alt="${escapeHtml(route.photo2Alt)}" loading="lazy">
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
        <div class="dialog-hero">
          <img src="${escapeHtml(route.photo)}" alt="${escapeHtml(route.photoAlt)}" loading="lazy">
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
              <article class="dialog-stay-card">
                <img src="${escapeHtml(stay.photo)}" alt="${escapeHtml(stay.photoAlt)}" loading="lazy">
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
    <article class="stay-card">
      <img src="${escapeHtml(stay.photo)}" alt="${escapeHtml(stay.photoAlt)}" loading="lazy">
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

function projectMapCoordinate(lon, lat) {
  const width = 820;
  const height = 460;
  const inset = 42;
  const points = [mapOrigin, ...routeMapPoints.filter((point) => eligibleRouteIds.has(point.id))];
  const referenceLatitude = points.reduce((sum, point) => sum + point.lat, 0) / points.length * Math.PI / 180;
  const longitudeScale = Math.cos(referenceLatitude);
  const projected = points.map((point) => ({
    lon: point.lon * longitudeScale,
    lat: point.lat
  }));
  const west = Math.min(...projected.map((point) => point.lon));
  const east = Math.max(...projected.map((point) => point.lon));
  const south = Math.min(...projected.map((point) => point.lat));
  const north = Math.max(...projected.map((point) => point.lat));
  const longitudeSpan = east - west;
  const latitudeSpan = north - south;
  const drawWidth = width - inset * 2;
  const drawHeight = height - inset * 2;
  const scale = Math.min(drawWidth / longitudeSpan, drawHeight / latitudeSpan);
  const centerLon = (west + east) / 2;
  const centerLat = (south + north) / 2;
  const x = (lon * longitudeScale - centerLon) * scale + width / 2;
  const y = (centerLat - lat) * scale + height / 2;
  return {
    x,
    y,
    referenceLatitude
  };
}

function renderRegionMap() {
  const activePoints = routeMapPoints.filter((point) => eligibleRouteIds.has(point.id));
  const origin = projectMapCoordinate(mapOrigin.lon, mapOrigin.lat);
  const markers = activePoints.map((point) => {
    const position = projectMapCoordinate(point.lon, point.lat);
    return `
      <a href="#route-${escapeHtml(point.id)}" class="map-stop map-stop--${escapeHtml(point.group)}"
        data-route-id="${escapeHtml(point.id)}" aria-label="${escapeHtml(point.name)}，打开路线详情">
        <title>${escapeHtml(point.name)} · ${point.lon.toFixed(6)}, ${point.lat.toFixed(6)}</title>
        <circle cx="${position.x.toFixed(1)}" cy="${position.y.toFixed(1)}" r="13"></circle>
        <text x="${position.x.toFixed(1)}" y="${(position.y + 5).toFixed(1)}">${escapeHtml(point.short)}</text>
      </a>`;
  }).join("");
  const links = activePoints.map((point) => {
    const position = projectMapCoordinate(point.lon, point.lat);
    return `<line x1="${origin.x.toFixed(1)}" y1="${origin.y.toFixed(1)}"
      x2="${position.x.toFixed(1)}" y2="${position.y.toFixed(1)}"
      class="map-link map-link--${escapeHtml(point.group)}"></line>`;
  }).join("");
  const routeIndex = activeGroups
    .map((group) => {
      const routes = allRoutes.filter((route) => route.group === group.id);
      return `
        <div class="map-index-group">
          <p><i class="map-group-dot map-group-dot--${escapeHtml(group.id)}"></i>${escapeHtml(group.title)}</p>
          ${routes.map((route) => `
            <a href="#route-${escapeHtml(route.id)}" data-route-id="${escapeHtml(route.id)}">
              <strong>${escapeHtml(route.id.replace(/^0/, ""))}</strong>
              <span>${escapeHtml(routeRegionLabel(route))}<small>${escapeHtml(route.travel)}</small></span>
            </a>`).join("")}
        </div>`;
    }).join("");

  return `
    <section class="map-section" id="map" aria-labelledby="map-title">
      <header class="map-heading">
        <div>
          <p class="section-eyebrow">单程控制在 ${maxDriveMinutes} 分钟内</p>
          <h2 id="map-title">90 分钟驾车圈</h2>
        </div>
        <p>按高德经纬度等比定位；连线只表示从陆家嘴出发的方向，不是道路轨迹。车程来自本次高德路线规划，出发时仍以实时导航为准。</p>
      </header>
      <div class="map-frame">
        <svg class="region-map" viewBox="0 0 820 460" role="img"
          aria-labelledby="map-svg-title map-svg-desc">
          <title id="map-svg-title">90 分钟驾车路线落点图</title>
          <desc id="map-svg-desc">以陆家嘴为起点，按真实经纬度显示花开半夏、新场古镇、川沙古镇和比斯特上海。</desc>
          <rect class="map-background" width="820" height="460" rx="8"></rect>
          <g class="map-grid" aria-hidden="true">
            <path d="M42 150H778M42 231H778M42 312H778"></path>
            <path d="M226 42V418M410 42V418M594 42V418"></path>
          </g>
          <text class="map-frame-label" x="58" y="78">上海及近郊</text>
          <text class="map-coordinate-label" x="58" y="99">按经纬度等比绘制</text>
          <g class="map-links" aria-hidden="true">${links}</g>
          <g class="map-origin" aria-label="起点陆家嘴">
            <circle class="map-origin-halo" cx="${origin.x.toFixed(1)}" cy="${origin.y.toFixed(1)}" r="23"></circle>
            <circle class="map-origin-dot" cx="${origin.x.toFixed(1)}" cy="${origin.y.toFixed(1)}" r="7"></circle>
            <text x="${origin.x.toFixed(1)}" y="${(origin.y + 39).toFixed(1)}">陆家嘴出发</text>
          </g>
          <g class="map-stops">${markers}</g>
        </svg>
      </div>
      <div class="map-route-index" aria-label="路线地图索引">${routeIndex}</div>
      <div class="map-legend" aria-label="地图图例">
        <span><i class="legend-dot"></i>实心点是陆家嘴起点</span>
        <span><i class="legend-line"></i>虚线只表示出发方向</span>
        <span>点编号打开对应路线</span>
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
        ${routes.map(renderRouteLauncher).join("")}
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

const regionLinks = `<a href="#ranking" aria-current="true">总榜</a>` + activeGroups.map((group) => `
  <a href="#region-${group.id}">${escapeHtml(group.title)}</a>`).join("") + `
  <a href="#map">位置图</a>
  <a href="#stays">住宿候选</a>`;

const stayCount = allStays.length;
const routeCount = allRoutes.length;
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
      overflow-x: auto;
      overflow-y: hidden;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: #e8efe9;
      box-shadow: var(--shadow);
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
    }

    .region-map {
      display: block;
      width: 100%;
      min-width: 760px;
      height: auto;
    }

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
      padding: 0;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--surface-strong);
      box-shadow: var(--shadow);
      list-style: none;
    }

    .rank-board li + li { border-top: 1px solid var(--line); }

    .rank-row {
      display: grid;
      grid-template-columns: 38px 68px minmax(0, 1fr) 18px;
      grid-template-areas:
        "rank photo main arrow"
        "rank photo score arrow";
      gap: 7px 10px;
      width: 100%;
      padding: 15px 11px;
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
    .row-rank {
      grid-area: rank;
      color: #8b968f;
      font-size: 18px;
      font-weight: 900;
      font-variant-numeric: tabular-nums;
    }
    .row-photo {
      grid-area: photo;
      width: 68px;
      height: 68px;
      border-radius: 6px;
      object-fit: cover;
      background: #dbe1dc;
    }
    .row-main {
      grid-area: main;
      display: grid;
      min-width: 0;
      align-content: start;
      gap: 4px;
    }
    .row-region { color: var(--rust); font-size: 14px; font-weight: 900; }
    .row-main > strong { font-size: 20px; line-height: 1.38; }
    .row-review {
      display: -webkit-box;
      overflow: hidden;
      color: #46554d;
      font-size: 16px;
      line-height: 1.5;
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
      gap: 5px 6px;
      margin-top: 2px;
      padding: 0;
      border: 0;
      background: transparent;
      font-size: 15px;
    }
    .place-review-meta--row .place-review-label { font-size: 14px; }
    .place-review-meta--row .place-review-chip { padding: 1px 6px; font-size: 15px; }
    .place-review-meta--row .place-review-chip strong { font-size: 17px; }
    .place-review-meta--row .place-review-chip small { font-size: 14px; }
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
    .row-tags { display: flex; flex-wrap: wrap; gap: 5px; }
    .row-tags span {
      padding: 2px 7px;
      border-radius: 999px;
      background: var(--green-soft);
      color: var(--green);
      font-size: 13px;
      font-weight: 800;
      line-height: 1.45;
    }
    .row-score {
      grid-area: score;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--ink);
    }
    .row-score > span:first-child { white-space: nowrap; }
    .row-score b { font-size: 24px; line-height: 1; font-variant-numeric: tabular-nums; }
    .row-score small { margin-left: 2px; color: var(--muted); font-size: 13px; font-weight: 800; }
    .row-arrow { grid-area: arrow; align-self: center; color: #75867c; font-size: 30px; line-height: 1; }

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
      margin-top: 4px;
      padding: 9px 10px;
      box-shadow: none;
    }
    .stay-reference--row .stay-reference-heading small { font-size: 12px; }
    .stay-reference--row .stay-reference-item { grid-template-columns: 52px minmax(0, 1fr); gap: 8px; }
    .stay-reference--row .stay-reference-item img { width: 52px; height: 52px; }
    .stay-reference--row .stay-reference-copy > strong { font-size: 16px; }
    .stay-reference--row .stay-reference-score,
    .stay-reference--row .stay-reference-fit { font-size: 13px; }

    body.dialog-open { overflow: hidden; }

    .route-dialog {
      width: min(940px, calc(100% - 24px));
      max-width: none;
      max-height: calc(100dvh - 24px);
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
      min-height: 58px;
      padding: 8px 10px 8px 16px;
      border-bottom: 1px solid var(--line);
      background: rgba(255, 253, 248, .97);
      backdrop-filter: blur(12px);
      color: var(--muted);
      font-size: 16px;
      font-weight: 800;
    }

    .dialog-close {
      min-width: 52px;
      min-height: 44px;
      padding: 7px 12px;
      border: 1px solid #b9c4bc;
      border-radius: var(--radius);
      background: var(--surface-strong);
      color: var(--ink);
      font: inherit;
      font-size: 16px;
      font-weight: 900;
      cursor: pointer;
    }
    .dialog-close:focus-visible { outline: 3px solid #89ad98; outline-offset: 2px; }

    .route-dialog-body {
      max-height: calc(100dvh - 84px);
      overflow-y: auto;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }

    .dialog-hero { position: relative; min-height: 270px; background: #cfd8d0; }
    .dialog-hero > img { width: 100%; height: 280px; object-fit: cover; }
    .dialog-hero-copy {
      position: absolute;
      inset: auto 0 0;
      padding: 72px 18px 18px;
      background: linear-gradient(transparent, rgba(22, 31, 26, .92));
      color: white;
    }
    .dialog-region { font-size: 15px; font-weight: 900; }
    .dialog-hero h2 { margin-top: 5px; font-size: 31px; font-weight: 900; }
    .dialog-travel { margin-top: 8px; color: #eef1ed; font-size: 16px; line-height: 1.55; }

    .score-panel {
      margin: 16px;
      padding: 16px;
      border: 1px solid #c7d5cb;
      border-radius: var(--radius);
      background: var(--green-soft);
    }
    .score-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
    .score-heading > div { display: flex; align-items: baseline; }
    .score-heading > div strong { color: var(--green); font-size: 42px; font-weight: 900; line-height: 1; }
    .score-heading > div span { margin-left: 3px; color: var(--muted); font-size: 16px; font-weight: 800; }
    .score-heading .stars { font-size: 21px; }
    .score-parts {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin-top: 14px;
    }
    .score-parts > span {
      display: grid;
      padding: 8px 10px;
      border-radius: 6px;
      background: var(--surface-strong);
    }
    .score-parts b { color: var(--green); font-size: 22px; line-height: 1.2; }
    .score-parts small { color: var(--muted); font-size: 13px; font-weight: 700; line-height: 1.4; }
    .score-reason { margin-top: 13px; font-size: 17px; line-height: 1.65; }

    .score-details {
      margin-top: 12px;
      border-top: 1px solid #bdd0c2;
    }
    .score-details summary {
      display: flex;
      align-items: center;
      min-height: 48px;
      color: var(--blue);
      font-size: 16px;
      font-weight: 900;
      cursor: pointer;
      list-style: none;
    }
    .score-details summary::-webkit-details-marker { display: none; }
    .score-details summary::after { content: "＋"; margin-left: 7px; }
    .score-details[open] summary::after { content: "－"; }
    .score-detail-copy {
      padding: 11px 12px;
      border-radius: 6px;
      background: rgba(255, 255, 255, .72);
    }
    .score-detail-copy p { font-size: 16px; line-height: 1.65; }
    .score-detail-copy p + p { margin-top: 8px; }
    .score-detail-copy strong,
    .source-note strong { display: block; color: var(--green); font-size: 13px; }
    .score-method { margin-top: 10px; color: var(--muted); font-size: 14px; }

    .dialog-stay-section {
      margin: 16px;
      padding: 16px;
      border: 1px solid #cfd9d2;
      border-radius: var(--radius);
      background: #f8f7f1;
    }
    .dialog-stay-heading h3 { font-size: 25px; }
    .dialog-stay-heading p { margin-top: 5px; color: var(--muted); font-size: 16px; line-height: 1.6; }
    .dialog-stay-grid { display: grid; grid-template-columns: 1fr; gap: 14px; margin-top: 14px; }
    .dialog-stay-card {
      overflow: hidden;
      border: 1px solid #d2d9d4;
      border-radius: 8px;
      background: var(--surface-strong);
    }
    .dialog-stay-card > img {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 9;
      object-fit: cover;
      background: #d8e1db;
    }
    .dialog-stay-body { padding: 13px 14px 15px; }
    .dialog-stay-title-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      align-items: start;
    }
    .dialog-stay-title-row h4 { font-size: 20px; line-height: 1.4; }
    .dialog-stay-title-row span {
      padding: 2px 7px;
      border-radius: 6px;
      background: var(--rust-soft);
      color: var(--rust);
      font-size: 16px;
      font-weight: 900;
      white-space: nowrap;
    }
    .dialog-stay-rating { margin-top: 2px; color: var(--muted); font-size: 14px; }
    .stay-amenities--dialog { margin-top: 8px; }
    .dialog-stay-review,
    .dialog-stay-confirm,
    .dialog-stay-fit { margin-top: 9px; font-size: 16px; line-height: 1.6; }
    .dialog-stay-review strong,
    .dialog-stay-confirm strong {
      display: block;
      color: var(--green);
      font-size: 13px;
    }
    .dialog-stay-fit {
      padding: 7px 9px;
      border-radius: 6px;
      background: var(--blue-soft);
      color: #23565e;
      font-weight: 800;
    }
    .dialog-stay-confirm {
      padding: 9px 10px;
      border-radius: 6px;
      background: var(--gold-soft);
    }
    .dialog-stay-confirm strong { color: #79511a; }
    .dialog-stay-body > a {
      display: inline-flex;
      align-items: center;
      min-height: 46px;
      margin-top: 5px;
      font-size: 16px;
      font-weight: 800;
    }

    .route-dialog > .route-dialog-body > .review-line,
    .route-dialog > .route-dialog-body > .fee-line,
    .route-dialog > .route-dialog-body > .activity-line { margin-left: 16px; margin-right: 16px; }
    .route-dialog > .route-dialog-body > .activity-line { padding-top: 0; }
    .route-dialog .route-detail {
      padding: 0 16px 24px;
      border-top: 0;
      background: transparent;
    }

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
        grid-template-columns: 48px 86px minmax(0, 1fr) 112px 20px;
        grid-template-areas: "rank photo main score arrow";
        align-items: center;
        gap: 15px;
        padding: 16px 18px;
      }
      .row-rank { font-size: 20px; }
      .row-photo { width: 86px; height: 86px; }
      .row-main { gap: 5px; }
      .row-region { font-size: 15px; }
      .row-main > strong { font-size: 22px; }
      .row-review { font-size: 17px; -webkit-line-clamp: 1; }
      .place-review-meta { font-size: 17px; }
      .place-review-chip { font-size: 16px; }
      .place-review-chip strong { font-size: 19px; }
      .place-review-chip small,
      .place-review-note { font-size: 15px; }
      .place-review-meta--row { font-size: 16px; }
      .place-review-meta--row .place-review-label { font-size: 15px; }
      .place-review-meta--row .place-review-chip { font-size: 16px; }
      .place-review-meta--row .place-review-chip strong { font-size: 18px; }
      .place-review-meta--row .place-review-chip small { font-size: 15px; }
      .place-review-meta--dialog {
        margin-left: 22px;
        margin-right: 22px;
      }
      .row-tags span { padding: 3px 8px; font-size: 14px; }
      .row-score { display: grid; align-content: center; justify-items: end; gap: 3px; }
      .row-score b { font-size: 28px; }
      .row-arrow { font-size: 32px; }
      .route-title { font-size: 32px; }
      .review-line,
      .fee-line { font-size: 19px; }
      .dialog-bar { padding-left: 22px; }
      .dialog-hero,
      .dialog-hero > img { height: 350px; }
      .dialog-hero-copy { padding: 96px 24px 24px; }
      .dialog-region { font-size: 16px; }
      .dialog-hero h2 { font-size: 37px; }
      .dialog-travel { font-size: 17px; }
      .score-panel { margin: 22px; padding: 20px; }
      .score-parts { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .score-reason { font-size: 18px; }
      .score-detail-copy p { font-size: 17px; }
      .dialog-stay-section { margin: 22px; padding: 20px; }
      .dialog-stay-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .dialog-stay-heading h3 { font-size: 28px; }
      .dialog-stay-heading p { font-size: 17px; }
      .dialog-stay-title-row h4 { font-size: 21px; }
      .dialog-stay-review,
      .dialog-stay-confirm,
      .dialog-stay-fit { font-size: 17px; }
      .route-dialog > .route-dialog-body > .review-line,
      .route-dialog > .route-dialog-body > .fee-line,
      .route-dialog > .route-dialog-body > .activity-line { margin-left: 22px; margin-right: 22px; }
      .route-dialog .route-detail { padding: 0 22px 28px; }
      .stay-rating { font-size: 16px; }
      .stay-review,
      .stay-confirm { font-size: 19px; }
      .stay-fit { font-size: 17px; }
      .page-note p { font-size: 17px; }
    }

    @media (max-width: 719px) {
      .intro { padding-top: 34px; }
      .intro h1 { font-size: 40px; }
      .intro-lead { font-size: 20px; }
      .map-heading h2,
      .ranking-heading h2,
      .region-heading h2 { font-size: 36px; }
      .map-heading > p,
      .ranking-heading > p,
      .region-intro { font-size: 18px; }
      .map-frame { margin-right: -1px; }
      .rank-row {
        grid-template-columns: 28px 84px minmax(0, 1fr) 18px;
        grid-template-areas:
          "rank photo region arrow"
          "rank photo title arrow"
          "rank photo review arrow"
          "score score score score"
          "place place place place"
          "stay stay stay stay"
          "tags tags tags tags";
        gap: 7px 9px;
        min-height: 0;
        padding: 15px 14px 17px;
        align-items: start;
      }
      .row-rank { padding-top: 2px; font-size: 16px; }
      .row-photo { width: 84px; height: 84px; }
      .row-main { display: contents; }
      .row-region { grid-area: region; align-self: end; }
      .row-main > strong { grid-area: title; font-size: 22px; line-height: 1.3; }
      .row-review {
        grid-area: review;
        font-size: 17px;
        line-height: 1.48;
        -webkit-line-clamp: 3;
      }
      .place-review-meta--row {
        grid-area: place;
        margin-top: 4px;
        padding: 8px 9px;
        border: 1px solid #cfdad3;
        background: #f7faf7;
      }
      .stay-reference--row {
        grid-area: stay;
        margin-top: 3px;
        padding: 12px;
      }
      .stay-reference--row .stay-reference-heading strong { font-size: 18px; }
      .stay-reference--row .stay-reference-heading small { font-size: 14px; }
      .stay-reference--row .stay-reference-item {
        grid-template-columns: 76px minmax(0, 1fr);
        gap: 12px;
      }
      .stay-reference--row .stay-reference-item img { width: 76px; height: 76px; }
      .stay-reference--row .stay-reference-copy > strong { font-size: 18px; }
      .stay-reference--row .stay-reference-score,
      .stay-reference--row .stay-reference-fit,
      .stay-reference--row .stay-reference-more { font-size: 15px; }
      .stay-reference--row .stay-amenities span { font-size: 14px; }
      .row-score {
        grid-area: score;
        justify-content: flex-start;
        gap: 12px;
        padding-top: 2px;
      }
      .row-score b { font-size: 25px; }
      .row-arrow { grid-area: arrow; align-self: start; padding-top: 1px; font-size: 26px; }
      .row-tags { grid-area: tags; margin-top: 1px; }
      .route-title { font-size: 28px; }
      .dialog-hero { min-height: 290px; }
      .dialog-hero > img { height: 300px; }
      .dialog-hero h2 { font-size: 29px; }
      .score-parts > span { min-height: 66px; }
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
        <strong>${routeCount} 条玩法路线</strong>，单程都控制在 90 分钟内。总榜和路线卡直接带上就近住宿参考，先看玩法，再按多人设施和 4 房适配挑落脚点。
      </p>
    </section>

    ${renderRegionMap()}

    ${rankingBoard}

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

  ${routeDialogs}

  <footer class="page-note">
    <div class="page-note-inner">
      <p>资料复核：携程问道、美团旅行 CLI、高德 MCP。车程按陆家嘴出发的本次高德路线规划筛选，只保留单程 90 分钟内候选；票价、开放时间、船班和现场收费会变，出发前再查官方渠道。</p>
    </div>
  </footer>
  <script>
    (() => {
      const closeDialog = (dialog) => {
        if (dialog?.open) dialog.close();
      };

      document.addEventListener("click", (event) => {
        const opener = event.target.closest("[data-route-id]");
        if (opener) {
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
