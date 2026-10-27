# 金山复核报告（路线 04 / 05 / 06 / 15）

- 研究日期：2026-10-27
- 固定条件：6 成人、4 间房、2026-10-31 入住 1 晚
- 高德起点：上海陆家嘴（陆家嘴地铁站，121.502129,31.238259）
- 数据源：携程问道 wendao_query.js（WENDAO_API_KEY 已配置）、美团 CLI `mttravel 上海 "<查询>"`、高德 MCP
- 数据源状态备注：**携程问道 token 触发每日限额（Per-token daily limit exceeded (30)），疑似与其他并行 agent 共享同一 token**。实际成功返回：金山嘴渔村、枫泾古镇、枫叶岛 3 条；花开海上生态园与 4 处住宿的问道查询未能执行。
- 高德天气：`maps_weather` 金山区返回 UNKNOWN_ERROR，天气记为 **not returned**。

---

## 路线 04 金山 · 金山嘴

### 景点：金山嘴渔村

- id: 04（主景点）
- name: 上海金山嘴渔村（金山嘴渔村）
- area: 上海市金山区山阳镇沪杭公路 6394 号
- exactMatch: exact
- ctrip:
  - 查询："上海金山嘴渔村景点门票和评价怎么样"（问道，2026-10-27，已返回）
  - 精确结果：国家 4A 级景区；评分 4.4/5，381 条评论（与仓库留存的携程景点页 place_jinshan.html 抓取值 4.4/381 一致）
  - 事实：开放 09:00-16:30（16:00 停止入园）；建议游览 2-4 小时；票务咨询 021-37216777 / 021-37211869；**问道 result 注明"官方信息显示暂停营业，出行前建议电话确认是否恢复开放"——需电话核实**
  - URL: https://gs.ctrip.com/html5/you/sight/shanghai2/143744.html
- meituan:
  - 查询：`mttravel 上海 "金山嘴渔村"`（已返回）
  - 精确结果：金山嘴渔村，评分 4.1；全天 08:30-17:00（最晚入园 16:30）；街区免费、展馆联票 40 元、单馆 10 元；春节联票半价 20 元
- amap:
  - POI B0FFF5V6IR「上海金山嘴渔村」沪杭公路 6394 号，坐标 121.373798,30.732463，高德评分 4.5
  - 陆家嘴驾车：82.9 公里 / 约 94 分钟
- weather: not returned（高德金山区查询 UNKNOWN_ERROR）
- fees（只保留门票/游玩收费提示）:
  - 渔村老街区域免费逛，不必买票
  - 收费展馆联票（海渔文化馆、渔民老宅、渔具馆、妈祖文化馆、民间收藏馆等）：美团口径联票 40 元、单馆 10 元；携程有成人/学生/亲子票种，实时价以门票页为准
  - 差评提示"老街就不错，不值得买票看展馆"，可先逛老街再决定
  - 节假日停车难，小车停车费以现场为准
- 最值得玩的项目：渔村老街＋海鲜午饭（黄鱼面、黄鱼馄饨、油墩子）；时间够再挑 1-2 个展馆；城市沙滩滨海步道短走一段（约 3 公里外）
- 雨天/晴天适配：晴天更好（海边步道看天）；雨天主打老街吃逛＋室内展馆，但展馆小且部分不开空调
- oneLineReview: 上海最后一个渔村，老街免费、海鲜鲜甜（黄鱼面/油墩子口碑集中），展馆小不值专程买票，海边只当散步看
- reservationQuestions:
  - 问道 result 提示"官方信息显示暂停营业"，出行前必须打 021-37216777 核实是否正常开放
  - 展馆联票当日是否全馆开放
- images:
  - https://dimg04.c-ctrip.com/images/0104a120008xn567d7985_W_1280_853_R5_Q70.jpg（金山嘴渔村景点图，携程景点相册）
  - https://dimg04.c-ctrip.com/images/1mh2f12000pb4y58mBA24_W_1280_853_R5_Q70.jpg?proc=autoorient（游客图，2025-10-26，携程评论 230310851）
  - https://dimg04.c-ctrip.com/images/1mh2j12000pb51vx50649_W_1280_853_R5_Q70.jpg?proc=autoorient（游客图，同上）
  - 均来自基线 reviewData，与景点精确对应
- sources: 携程问道 result（2026-10-27）；mttravel CLI（2026-10-27）；高德 POI B0FFF5V6IR + 驾车路径；仓库 place_jinshan.html / place_jinshan-reviews.html / more-reviews.json(place_jinshan)
- conflicts:
  - 营业时间：问道 09:00-16:30 vs 美团 08:30-17:00 vs 高德 opentime 09:00-16:30 → 以景区电话为准，页面用"09:00-16:30（以现场为准）"
  - 开放状态：问道提示"暂停营业"，美团/高德无此提示 → 标"出行前电话确认"
- confidence: high（三源均有命中，仅开放状态需核实）
- baselinePreserved: 是。行程骨架（渔村老街＋午饭、城市沙滩步道一段）、reviewLine「海鲜氛围强，海边只当散步看」、routeRatings rank 8/78、listTags 全部保留

### 住宿（晚上落脚参考，不展开）：渔见山居·民宿(金山城市沙滩金山嘴渔村店)

- exactMatch: exact
- ctrip: 问道未查（限额）；基线携程酒店页 https://hotels.ctrip.com/hotels/24478261.html（2 间大床＋1 间双床，床数和空房下单前确认）
- meituan: `mttravel 上海 "渔见山居民宿 金山嘴渔村"` exact 命中，沪杭公路 6422-1 号，2018 年开业，经济型，美团暂无评分/暂无线上报价，电话 13818732613
- amap: 距金山嘴渔村东门步行约 140 米（美团口径）；未单独取 POI 坐标
- 图片（基线，与房源精确对应）：
  - https://dimg04.c-ctrip.com/images/1mc2v12000kp0iin8265A_W_1280_853_R5_Q70.jpg（全海景海夕大床房）
  - https://dimg04.c-ctrip.com/images/1mc3s12000lvdxybi166F_W_1280_853_R5_Q70.jpg（公共区域）
- conflicts: 无；confidence: medium（美团无评分，房态需电话确认）；baselinePreserved: 是

---

## 路线 05 金山 · 枫泾

### 景点：枫泾古镇

- id: 05（主景点）
- name: 枫泾古镇
- area: 上海市金山区枫泾镇亭枫公路 8588 弄 28 号
- exactMatch: exact
- ctrip:
  - 查询："上海枫泾古镇景点门票价格 开放时间 游客评价怎么样"（问道，已返回）
  - 精确结果：评分 4.4/5，约 1990 条评论（与 place_fengjing.html 抓取值一致）；入选上海夜游必打卡景点榜；古镇街区全天开放；8 月 9 日-8 月 11 日特殊闭园（与本行程 10/31 无关）
  - 事实：52 座古桥、元代致和桥约 700 年；建议游览 3-5 小时；票务咨询 021-57355555；停车场小车 10 元/次、大巴 15 元/次；手摇船南大街金圃宅第码头，限载 6 人、全程约 40 分钟
  - URL: https://gs.ctrip.com/html5/you/sight/shanghai2/49029.html
- meituan:
  - 查询：`mttravel 上海 "枫泾古镇"`（已返回）
  - 精确结果：枫泾古镇景区，4A，全天开放（内部小景点 08:00-16:30），大门免费；联票 41.6 元（金圃宅第＋丁聪美术馆＋程十发祖居＋张慈中装帧艺术馆＋丁蹄作坊）
- amap:
  - POI B001556VY1，坐标 121.016281,30.886969，高德评分 4.7
  - 陆家嘴驾车：73.8 公里 / 约 93 分钟
- weather: not returned
- fees:
  - 古镇街区免费进，不买票也能逛主街和长廊
  - 收费场馆通票：问道口径成人 42 元、学生/60-64 岁老人 25 元；美团联票 41.6 元（两处口径基本一致，实时价以门票页为准）
  - 手摇船限载 6 人约 40 分钟，船票价格未在返回中给出 → "坐船价格现场先问"
  - 停车小车 10 元/次
- 最值得玩的项目：枫溪长廊＋三桥慢逛（雨天不湿鞋）、丁蹄作坊看演示、丁聪美术馆/人民公社旧址挑 1-2 个、手摇船 6 人一船刚好一船装下
- 雨天/晴天适配：**雨天适配最好**（长廊"晴天遮阳、雨天不湿鞋"是评论高频点），雨天备选茶馆/展馆充足
- oneLineReview: 人少清净、烟火气足，丁蹄和长廊都稳，节奏适合慢走；比朱家角七宝人少是评论共识
- reservationQuestions: 手摇船当日班次与价格；节假日停车建议导航 4 号停车场
- images:
  - https://dimg04.c-ctrip.com/images/10021f000001gxcsa66B7_W_1280_853_R5_Q70.jpg（携程景点相册）
  - https://dimg04.c-ctrip.com/images/0106m12000f3w4pm0FA82_W_1280_853_R5_Q70.jpg（携程景点相册）
  - https://dimg04.c-ctrip.com/images/1lo0212000kvj3ipc3247_W_1280_853_R5_Q70.jpg（携程景点相册）
- sources: 携程问道 result；mttravel CLI；高德 POI B001556VY1 + 驾车路径；仓库 place_fengjing.html / place_fengjing-reviews.html / more-reviews.json(place_fengjing)
- conflicts: 通票价格 42 元（问道）vs 41.6 元（美团）→ 页面写"约 42 元，实时价以购票页为准"
- confidence: high
- baselinePreserved: 是。reviewLine「吃和逛都稳，节奏适合慢走」、routeRatings rank 4/81、雨天替代标记全部保留

### 住宿（落脚参考）：上海枫泾福朋喜来登酒店

- exactMatch: exact
- ctrip: 问道未查（限额）；基线携程酒店页 https://hotels.ctrip.com/hotels/117473229.html
- meituan: `mttravel 上海 "枫泾福朋喜来登酒店"` exact 命中：五星/豪华型，4.7 分（922 条评价），枫泾镇枫美路 1199 号，021-37908888；法式湖畔庄园、恒温泳池、儿童乐园；距枫泾古镇景区直线约 1.4 公里
- amap: 未单独取 POI；距枫泾古镇约 1.4 公里（美团口径）
- 图片（基线，精确对应）：
  - https://dimg04.c-ctrip.com/images/1mc5o12000e45urt95205_W_1280_853_R5_Q70.jpg（酒店外部）
  - https://dimg04.c-ctrip.com/images/1mc4b12000e4l7og79C7C_W_1280_853_R5_Q70.jpg（公共区域）
- conflicts: 无；confidence: high；baselinePreserved: 是（注：该酒店为单间预订型，6 人需订多间，仅作落脚参考，不做推荐排序）

---

## 路线 06 金山 · 廊下（枫叶岛＋山塘）

### 景点 A：枫叶岛

- id: 06（主景点）
- name: 枫叶岛
- area: 上海市金山区廊下镇山塘村（廊华路，涵七民宿东北侧约 200 米）
- exactMatch: exact
- ctrip:
  - 查询："上海金山廊下枫叶岛景点门票 最佳观赏时间 游客评价"（问道，已返回）
  - 精确结果：上海赏秋景点榜第 4 名，线上评分约 4.1-4.4；place_mapleisland.html 抓取值为 4.4 / 61 条评论
  - 事实：占地 300 亩，北美红枫 8000 余株＋北美枫香＋红叶石楠；**最佳观赏期 11 月中旬-12 月上旬**；免费、全年全天开放；咨询 021-57320171；**廊华路（新风路-向阳河）段半幅施工，自驾留意**
  - URL: https://gs.ctrip.com/html5/you/sight/shanghai2/1510071.html
- meituan:
  - 查询：`mttravel 上海 "枫叶岛"`（已返回）
  - 精确结果：枫叶岛，评分 4.0，金山区廊下镇山塘村新建江 4 组；免费开放无需预约；免费停车（路边）；可徒步、骑行、湖上划船、野餐拍照
- amap:
  - POI B0FFFHOQQ4，坐标 121.175458,30.776325，高德评分 4.3，24 小时开放
  - 陆家嘴驾车：89.0 公里 / 约 101 分钟
- weather: not returned
- fees:
  - 门票免费、停车免费（车位少，周末紧张）
  - 湖上划船等项目价格未返回 → "现场项目收费先问"
- 最值得玩的项目：枫叶大道拍照、枫叶湖环湖步道、穿浅色衣服拍秋日大片
- 雨天/晴天适配：**强依赖晴天**（"阳光晴好出片率高"是评论共识）；雨天不建议专程去
- **季节冲突（重要）**：10/31 早于最佳观赏期（11 月中旬-12 月上旬）。评论实证：有游客"枫树红了两三棵…虽然有点早了"（早季）、也有"12 月初下过雨叶子掉得快"。10/31 去大概率只见黄绿相间，页面应如实提示"10 月底偏早，看红枫建议 11 月中下旬"
- oneLineReview: 免费 300 亩枫林，晴天很出片，但红叶窗口短、10 月底偏早，停车位少
- reservationQuestions: 出发前查当周红叶实况；廊华路施工段通行情况
- images:
  - https://dimg04.c-ctrip.com/images/10090e00000077u2l56E8_W_1280_853_R5_Q70.jpg（携程景点相册）
  - https://dimg04.c-ctrip.com/images/0105i1200085iki0h64B0_W_1280_853_R5_Q70.jpg（携程景点相册）
  - https://dimg04.c-ctrip.com/images/0HJ6i12000u77uxlaA39A_W_1280_853_R5_Q70.jpg（携程景点相册）
- sources: 携程问道 result；mttravel CLI；高德 POI B0FFFHOQQ4 + 驾车路径；仓库 place_mapleisland.html / place_mapleisland-reviews.html / more-reviews.json(place_mapleisland) / play-search-mapleisland_exact.json
- conflicts:
  - 评分：携程 4.4（61 条）vs 美团 4.0 vs 高德 4.3 → 并列标注来源
  - 位置表述：美团"新建江 4 组" vs 问道"涵七民宿东北侧 200 米" vs 高德"廊华路" → 同一地点不同表述，坐标一致
- confidence: high
- baselinePreserved: 是。reviewLine「拍照看季节，适合晴天乡村线」、routeRatings rank 13/71 保留；"看当周叶色"的基线表述与本次季节发现一致，建议在页面强化为明确提示

### 景点 B：山塘老街（明月山塘，沪浙交界）

- id: 06（子景点）
- name: 山塘老街（明月山塘）
- area: 上海市金山区廊下镇山塘村（一桥跨沪浙，南岸属浙江平湖）
- exactMatch: exact（高德 POI B0IUXHE2YG「山塘老街」，地址"明月山塘"）
- ctrip: 未单独查（问道限额）；仓库 play-search-langxia.json 中 Trip Moments 攻略证实"从枫叶岛步行可达，一桥两省"
- meituan: `mttravel 上海 "山塘老街 金山廊下"` 返回的是澄清追问而非数据 → 记 **miss（未返回有效结果）**
- amap:
  - POI B0IUXHE2YG，坐标 121.164876,30.775947，高德评分 4.5，24 小时开放
  - 陆家嘴驾车：89.7 公里 / 约 101 分钟；距枫叶岛约 1.4 公里（坐标差）
- weather: not returned
- fees: 开放式老街，无门票信息返回（按免费处理，标"免费开放"）
- 最值得玩的项目：山塘桥"一桥两省"打卡、老街小吃
- 雨天/晴天适配：街区型，小雨可逛；与枫叶岛打包成一条线
- oneLineReview: 枫叶岛顺路的老街，一桥跨沪浙，顺道逛不累、专程不值
- images: 高德 POI 图 https://store.is.autonavi.com/showpic/83051732b3993b720000004359626970?type=pic（高德相册，与 POI 精确对应）；无携程精确图 → 如嫌来源弱可用高德图或不留图
- sources: 高德 POI + 驾车路径；仓库 play-search-langxia.json（Trip Moments 攻略）
- conflicts: 无；confidence: medium（仅高德一源直接命中）
- baselinePreserved: 是（基线行程"山塘上海侧老街/茶"保留）

### 住宿（落脚参考）：上海涵七民宿

- exactMatch: exact
- ctrip: 问道未查（限额）；基线携程酒店页 https://hotels.ctrip.com/hotels/15698948.html；基线 villaCandidates 记录"金山整栋候选：4 室或 6 室"，含"别墅包栋 4 室 2 厅 4 卫（棋牌、K歌、烧烤、品茗）"房型图
- meituan: `mttravel 上海 "上海涵七民宿"` exact 命中：上海涵七民宿（枫叶岛店），金山区山塘村新建江 1037 号（枫叶岛内），经济型，美团暂无评分/暂无线上报价，电话 17317958757；独栋别墅、侘寂风、可带宠物、有烧烤区
- amap: POI B0FFJ94UI2「上海涵七民宿(廊华路分店)」，廊下镇山塘村新建江 1037 号（枫叶岛内）——与美团地址完全一致，且证实在枫叶岛内
- 图片（基线，精确对应）：
  - https://dimg04.c-ctrip.com/images/200t0z000000mpratD70E_W_1280_853_R5_Q70.jpg（酒店外部）
  - https://dimg04.c-ctrip.com/images/200o15000000ykkc4EF87_W_1280_853_R5_Q70.jpg（别墅包栋 4 室 2 厅 4 卫）
  - https://dimg04.c-ctrip.com/images/200g0z000000mqej39710_W_1280_853_R5_Q70.jpg（公共区域）
- conflicts: 无；confidence: medium-high（位置三源互证，评分与房态需电话确认）
- baselinePreserved: 是（villaCandidates key=hanqi 保留；4 间房需求对应其 4 室包栋，下单前确认床数）

---

## 路线 15 金山 · 朱泾（花开海上）

### 景点：花开海上生态园

- id: 15（主景点）
- name: 上海花开海上生态园
- area: 上海市金山区朱泾镇待泾村秀泾 6060 号
- exactMatch: exact（高德＋美团均命中；携程问道因限额未查，携程景点页 2045955 为基线来源）
- ctrip:
  - 查询：问道未能执行（Per-token daily limit exceeded (30)）
  - 基线/仓库证据：more-reviews.json(place_flower) 10 条携程真实评论（评分 4-5 为主）；携程景点页 https://gs.ctrip.com/html5/you/sight/shanghai2/2045955.html
- meituan:
  - 查询：`mttravel 上海 "花开海上生态园"`（已返回）
  - 精确结果：4A 景区，地址朱泾镇待泾村秀泾 6060 号；08:00-17:00；**门票 30 元，停车免费，实名入园**；电话 021-57320171 / 021-57320668；可携宠入园
- amap:
  - POI B0FFGRDHAA，坐标 121.119236,30.888178，高德评分 4.6，等级 AAAA，08:00-17:00
  - 陆家嘴驾车：73.9 公里 / 约 101 分钟
- weather: not returned
- fees:
  - 门票 30 元（美团口径），实名入园
  - 停车免费；公交到标志牌后有免费短驳车接送（携程评论实证）
  - 园内观光车/多人自行车价格未返回 → "多人车收费先问"（与基线口径一致）
- 最值得玩的项目：地肤草观赏区（秋季招牌）、花海露营地野餐、星空草坪；下午 3-5 点逆光拍地肤（美团建议）
- 雨天/晴天适配：晴天更值（拍照向）；雨天大片花田体验打折，园内无大型室内场馆
- 季节提示：秋季主角是地肤，评论实证"地肤还没完全变红，黄绿相间也挺好看"；10/31 大概率处于转色期而非全红
- oneLineReview: 600 亩花海视野开阔，秋天地肤最出片；配套简单纯自然风光，想找热闹游乐项目的会觉得单调
- reservationQuestions: 地肤当周变红进度；多人车/观光车当日价格
- images（基线，精确对应）:
  - https://dimg04.c-ctrip.com/images/01062120009x99men72FE_W_1280_853_R5_Q70.jpg（携程景点相册）
  - https://dimg04.c-ctrip.com/images/01017120009x99ojq158D_W_1280_853_R5_Q70.png（携程景点相册）
  - https://dimg04.c-ctrip.com/images/0105l120009x99nkz419D_W_1280_853_R5_Q70.jpg（携程景点相册）
- sources: mttravel CLI；高德 POI B0FFGRDHAA + 驾车路径；仓库 more-reviews.json(place_flower)；基线携程景点页 2045955
- conflicts: 无实质冲突；问道缺失已标注
- confidence: medium-high（缺携程问道当次复核，但美团＋高德＋存量携程评论互证）
- baselinePreserved: 是。reviewLine「花海很出片，晴天更值」、routeRatings rank 7/79、"多人车（收费先问）"全部保留

### 住宿（落脚参考）：待泾花海小憩民宿(上海金山北站花开海上生态园店)

- exactMatch: probable（见下）
- ctrip: 问道未查（限额）；基线携程酒店页 https://hotels.ctrip.com/hotels/68088831.html
- meituan: `mttravel 上海 "待泾花海小憩民宿"` **miss** —— 美团明确回复"没有找到该民宿的具体信息"，返回的均为乐高乐园度假区附近其他民宿（不采用、不顶替）
- amap: **probable** —— POI B0G36BLSF0「上海花海小憩民宿」，地址"花开海上生态园(朱泾镇秀泾村秀泾六组 6060 号)"，名称相近且就在景区内，疑似同一家但名称不完全一致，按 probable 处理
- 图片（基线，精确对应）：
  - https://dimg04.c-ctrip.com/images/0202812000n3qp51170CB_W_1280_853_R5_Q70.jpg（酒店外部）
  - https://dimg04.c-ctrip.com/images/0584u12000snqketfDA0D_W_1280_853_R5_Q70.jpg（景观一室大床房）
- conflicts: 美团查无此店 vs 携程有酒店页 vs 高德有近似名称 POI → 页面标"待确认"，预订走携程链接或电话
- confidence: low-medium
- baselinePreserved: 是（保留为落脚参考，标待确认）

---

## 金山复核摘要

### exact / probable / miss 一览

| 对象 | 携程问道 | 美团 CLI | 高德 MCP | 综合 |
| --- | --- | --- | --- | --- |
| 金山嘴渔村 | exact（4.4/381） | exact（4.1） | exact（4.5，82.9km/94min） | **exact** |
| 枫泾古镇 | exact（4.4/约1990） | exact | exact（4.7，73.8km/93min） | **exact** |
| 枫叶岛 | exact（4.4/61） | exact（4.0） | exact（4.3，89.0km/101min） | **exact** |
| 山塘老街 | 未查（限额） | miss（返回澄清追问） | exact（4.5，89.7km/101min） | **exact（高德单源）** |
| 花开海上生态园 | 未查（限额） | exact（30 元门票） | exact（4.6，73.9km/101min） | **exact** |
| 渔见山居·民宿 | 未查（限额） | exact（无评分） | 未单独查 | exact |
| 上海枫泾福朋喜来登 | 未查（限额） | exact（4.7/922） | 未单独查 | exact |
| 上海涵七民宿 | 未查（限额） | exact（无评分） | exact（POI 在枫叶岛内） | exact |
| 待泾花海小憩民宿 | 未查（限额） | **miss** | **probable**（上海花海小憩民宿） | probable |

### 新发现（相对基线）

1. **季节冲突（最重要）**：枫叶岛最佳观赏期 11 月中旬-12 月上旬，10/31 出行偏早，大概率只见黄绿相间；花开海上地肤同期也处于转色期。基线"看当周叶色"表述应升级为明确的日期提示。
2. 枫泾手摇船限载 6 人、约 40 分钟，与 6 人出行完美匹配，可作卖点；船票价格需现场问。
3. 涵七民宿经高德＋美团双源确认就在**枫叶岛内**（新建江 1037 号），住它等于住进景点，与 06 路线天然绑定。
4. 枫叶岛廊华路（新风路-向阳河）段半幅施工（问道 result），自驾需留意。
5. 花开海上需实名入园、可携宠；公交可达且有免费短驳车（评论实证）。
6. 金山嘴渔村问道 result 提示"官方信息显示暂停营业"，与美团/高德的正常信息冲突，出行前必须电话 021-37216777 核实。

### 主要冲突与裁决

- 金山嘴营业时间三源不一致（09:00-16:30 / 08:30-17:00）→ 以现场/电话为准。
- 金山嘴"暂停营业"提示仅问道单源 → 不断言关闭，标"出行前电话确认"。
- 枫泾通票 42 元（问道）vs 41.6 元（美团）→ 写"约 42 元，实时价为准"。
- 待泾花海小憩民宿：美团查无、高德近似名 → probable，标待确认。
- 问道 token 每日限额 30 次被耗尽（疑似多 agent 共享），5 个对象缺问道当次复核，已用美团＋高德＋仓库存量携程证据补齐并如实标注。
