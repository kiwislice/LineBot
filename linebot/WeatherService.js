var service = { bot: null };

const SERVICE_ID = `WeatherService`;

const repository = require('../service/Repository');
const tools = require('../service/Tools');
const schedule = require("node-schedule");
const axios = require('axios');
const flex = require('../service/FlexMeaaageRandemCard');

var cache = {};
var 天氣警特報lastPushMsg = {};
const JOB_SETTING = '0 15,45 7-17 * * 1-5';
// const JOB_SETTING = '0 * * * * 1-5';

// 啟動時自動觸發排程
repository.getSubscribedUserId({ service_id: SERVICE_ID }, (response) => {
  var list = response.data.data.linebot_subscribed;
  list.forEach((elm) => {
    cache[elm.user_id] = schedule.scheduleJob(JOB_SETTING, async () => {
      console.log(`schedule run ${SERVICE_ID}`);
      var data = await getWC0033001Data();
      if (data) {
        var msg = toMsg(data);
        if (msg != 天氣警特報lastPushMsg[elm.user_id]) {
          service.bot.push(elm.user_id, msg);
          天氣警特報lastPushMsg[elm.user_id] = msg;
        }
      }
    });
    console.log(`${SERVICE_ID} add cache ${elm.user_id}`);
  });
});

/**中央氣象局授權碼 */
const Authorization = 'CWB-F1BC2EA4-B244-4E4A-B76C-3745648324B1';

/**
 * 天氣特報-各別縣市地區目前之天氣警特報情形
 * 災害性天氣特報資料(含豪(大)雨特報、低溫特報、陸上強風特報、濃霧特報、即時天氣訊息)
 * https://opendata.cwb.gov.tw/dataset/warning/W-C0033-001
 * @param {string} locationName 縣市名
 */
async function getWC0033001Data(locationName = '高雄市') {
  const API_URL = `https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/W-C0033-001?Authorization=${Authorization}&downloadType=WEB&format=JSON`;
  var data = {};
  await axios.get(API_URL).then(function (response) {
    try {
      // 縣市
      data.locationName = locationName;
      // 發布時間
      data.sent = new Date(response.data.cwbopendata.sent);
      var kao = response.data.cwbopendata.dataset.location.filter(x => x.locationName == locationName)[0];
      kao = kao.hazardConditions.hazards;

      var resolveHazardFunc = function (hazard) {
        var rtn = {};
        rtn.info = hazard.info.phenomena + hazard.info.significance;
        rtn.startTime = new Date(hazard.validTime.startTime);
        rtn.endTime = new Date(hazard.validTime.endTime);
        if (hazard.hazard) {
          var affectedAreas = hazard.hazard.info.affectedAreas;
          if (Array.isArray(affectedAreas)) {
            rtn.affectedAreas = affectedAreas.map(x => x.locationName).join();
          } else {
            rtn.affectedAreas = affectedAreas.location.locationName;
          }
        }
        return rtn;
      };

      if (Array.isArray(kao)) {
        data.hazards = kao.map(x => resolveHazardFunc(x));
      } else {
        data.hazards = [resolveHazardFunc(kao)];
      }
    } catch (e) {
      data = null;
    }
    // {
    //   "geocode": "10017",
    //   "hazardConditions":
    //   {
    //     "hazards": [
    //       {
    //         "hazard":
    //         {
    //           "info":
    //           {
    //             "affectedAreas":
    //             {
    //               "location":
    //               {
    //                 "locationName": "基隆北海岸"
    //               }
    //             },
    //             "language": "zh-TW",
    //             "phenomena": "大雨"
    //           }
    //         },
    //         "info":
    //         {
    //           "language": "zh-TW",
    //           "phenomena": "大雨",
    //           "significance": "特報"
    //         },
    //         "validTime":
    //         {
    //           "endTime": "2020-12-04T11:00:00+08:00",
    //           "startTime": "2020-12-03T09:59:00+08:00"
    //         }
    //       },
    //       {
    //         "info":
    //         {
    //           "language": "zh-TW",
    //           "phenomena": "陸上強風",
    //           "significance": "特報"
    //         },
    //         "validTime":
    //         {
    //           "endTime": "2020-12-06T17:00:00+08:00",
    //           "startTime": "2020-12-03T10:01:00+08:00"
    //         }
    //       }]
    //   },
    //   "locationName": "基隆市"
    // },
  });
  return data;
}


/**
 * 自動氣象站-氣象觀測資料
 * 自動氣象站資料-無人自動站氣象資料
 * https://opendata.cwb.gov.tw/dataset/observation/O-A0001-001
 */
async function getOA0001001Data() {
  const API_URL = `https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/O-A0001-001?Authorization=${Authorization}&downloadType=WEB&format=JSON`;
  var data = {};
  await axios.get(API_URL).then(function (response) {
    try {
      var kao = response.data.cwbopendata.location.filter(x => x.locationName == '三民')[0];
      // 觀測時間
      data.obsTime = new Date(kao.time.obsTime);
      kao.weatherElement.forEach(elm => {
        data[elm.elementName] = elm.elementValue.value;
      });
    } catch (e) {
      data.error = e;
    }
    // {
    //   "lat": "22.676689",
    //   "lat_wgs84": "22.6749111111111",
    //   "locationName": "左營",
    //   "lon": "120.276850",
    //   "lon_wgs84": "120.284911111111",
    //   "parameter": [
    //     {
    //       "parameterName": "CITY",
    //       "parameterValue": "高雄市"
    //     },
    //     {
    //       "parameterName": "CITY_SN",
    //       "parameterValue": "05"
    //     },
    //     {
    //       "parameterName": "TOWN",
    //       "parameterValue": "左營區"
    //     },
    //     {
    //       "parameterName": "TOWN_SN",
    //       "parameterValue": "311"
    //     }
    //   ],
    //   "stationId": "C0V810",
    //   "time": {
    //     "obsTime": "2020-12-01T08:00:00+08:00"
    //   },
    //   "weatherElement": [
    //     {
    //       "elementName": "ELEV",
    //       "elementValue": {
    //         "value": "32.0"
    //       }
    //     },
    //     {
    //       "elementName": "WDIR",
    //       "elementValue": {
    //         "value": "358"
    //       }
    //     },
    //     {
    //       "elementName": "WDSD",
    //       "elementValue": {
    //         "value": "1.1"
    //       }
    //     },
    //     {
    //       "elementName": "TEMP",
    //       "elementValue": {
    //         "value": "19.7"
    //       }
    //     },
    //     {
    //       "elementName": "HUMD",
    //       "elementValue": {
    //         "value": "0.84"
    //       }
    //     },
    //     {
    //       "elementName": "PRES",
    //       "elementValue": {
    //         "value": "1015.7"
    //       }
    //     },
    //     {
    //       "elementName": "H_24R",
    //       "elementValue": {
    //         "value": "0.0"
    //       }
    //     },
    //     {
    //       "elementName": "H_FX",
    //       "elementValue": {
    //         "value": "-99"
    //       }
    //     },
    //     {
    //       "elementName": "H_XD",
    //       "elementValue": {
    //         "value": "-99"
    //       }
    //     },
    //     {
    //       "elementName": "H_FXT",
    //       "elementValue": {
    //         "value": "-99"
    //       }
    //     },
    //     {
    //       "elementName": "D_TX",
    //       "elementValue": {
    //         "value": "20.80"
    //       }
    //     },
    //     {
    //       "elementName": "D_TXT",
    //       "elementValue": {
    //         "value": "2020-12-01T00:40:00+08:00"
    //       }
    //     },
    //     {
    //       "elementName": "D_TN",
    //       "elementValue": {
    //         "value": "18.60"
    //       }
    //     },
    //     {
    //       "elementName": "D_TNT",
    //       "elementValue": {
    //         "value": "2020-12-01T06:40:00+08:00"
    //       }
    //     }
    //   ]
    // },
  });
  return data;
}

/**
 * 取得最新的n個雷達回波圖URL
 * @param {number} n 
 * @returns {Array} [最新...最舊]
 */
function getNewestRadarPngUrl(n) {
  // const API_URL = `https://www.cwb.gov.tw/Data/radar/CV1_TW_3600_202011230920.png`;
  var now = new Date();
  var time = now.getFullYear() * 100000000;
  time += (now.getMonth() + 1) * 1000000;
  time += now.getDate() * 10000;
  time += now.getHours() * 100;
  time += now.getMinutes() - (now.getMinutes() % 10);

  var rtn = [];
  for (var i = 0; i < n; i++) {
    rtn.push(`https://www.cwb.gov.tw/Data/radar/CV1_TW_3600_${time}.png`);
    time -= 10;
    while ((time % 100) >= 60)
      time -= 10;
  }
  return rtn;
}

/**
 * 雷達回波圖
 */
async function getRadarPng() {
  var urls = getNewestRadarPngUrl(10);
  for (var i = 0; i < urls.length; i++) {
    var exist = false;
    await axios.head(urls[i]).then(function (response) {
      exist = true;
    }).catch(function (error) {
      console.log(`雷達回波圖url不存在:${urls[i]}`);
      // donothing
    });
    if (exist)
      return flex.mo_image(urls[i]);
  }
  return null;
}

/**getWC0033001Data資料轉訊息 */
function toMsg(data) {
  if (data == null)
    return '高雄市目前無天氣警特報';

  var msg = `${data.locationName}天氣警特報\n`;
  msg += `發布時間：${tools.toYMDHMS(data.sent)}\n\n`;
  data.hazards.forEach(x => {
    msg += `${x.info}\n`;
    msg += `開始時間：${tools.toYMDHMS(x.startTime)}\n`;
    msg += `結束時間：${tools.toYMDHMS(x.endTime)}\n`;
    if (x.affectedAreas) {
      msg += `影響範圍：${x.affectedAreas}\n`;
    }
    msg += '\n';
  });
  // {
  //   "sent": "2020-11-24T04:21:48+08:00",
  //   "info": "大雨特報",
  //   "startTime": "2020-11-24T04:16:00+08:00",
  //   "endTime": "2020-11-24T11:00:00+08:00",
  //   "affectedAreas": ["山區", "平地"]
  // }
  return msg;
}

const 蒲福風級ARRAY = [
  0.2, 1.5, 3.3, 5.4, 7.9, 10.7, 13.8, 17.1, 20.7, 24.4, 28.4, 32.6
];

/**
 * 蒲福風級
 * @param {number} speed 
 */
function 蒲福風級(speed) {
  if (speed == -99)
    return '-';
  for (let i = 0; i < 蒲福風級ARRAY.length; i++) {
    if (speed <= 蒲福風級ARRAY[i])
      return i;
  }
  return '>=12';
}

const 風向ARRAY = [
  [11.26, 33.75, '北東北'],
  [33.76, 56.25, '東北'],
  [56.26, 78.75, '東東北'],
  [78.76, 101.25, '東'],
  [101.26, 123.75, '東東南'],
  [123.76, 146.25, '東南'],
  [146.26, 168.75, '南東南'],
  [168.76, 191.25, '南'],
  [191.26, 213.75, '南西南'],
  [213.76, 236.25, '西南'],
  [236.26, 258.75, '西西南'],
  [258.76, 281.25, '西'],
  [281.26, 303.75, '西西北'],
  [303.76, 326.25, '西北'],
  [326.26, 348.75, '北西北'],
];

/**
 * 風向
 * @param {number} ang 角度
 */
function 風向(ang) {
  if (ang == -99)
    return '-';
  for (let i = 0; i < 風向ARRAY.length; i++) {
    if (風向ARRAY[0] <= ang && ang <= 風向ARRAY[1])
      return 風向ARRAY[2];
  }
  return '北';
}

/**getOA0001001Data資料轉訊息 */
function toMsg_OA0001001(data) {
  var msg = `🌤三民自動氣象站觀測資料\n`;
  msg += `觀測時間：${tools.toYMDHMS(data.obsTime)}\n`;
  msg += `溫度：${data.TEMP}°C\n`;
  msg += `風向：${風向(data.WDIR)}\n`;
  msg += `風速：${data.WDSD}m/s (${蒲福風級(data.WDSD)}級)\n`;
  msg += `相對溼度：${data.HUMD * 100}%\n`;
  msg += `日累積雨量：${data.H_24R}mm\n`;
  return msg;
}


service.handle = async function (cmd, event) {
  var sourceId = tools.getSourceId(event);
  if (sourceId == null) return false;

  if (cmd === "開啟天氣警特報通知") {
    repository.createSubscribedUserId({
      service_id: SERVICE_ID,
      user_id: sourceId,
    });
    if (!cache[sourceId]) {
      cache[sourceId] = schedule.scheduleJob(JOB_SETTING, async function () {
        console.log(`schedule run ${SERVICE_ID}`);
        var msg = await getAqiMsg();
        service.bot.push(sourceId, msg);
      });
    }
    event.reply(`已開啟天氣警特報通知`);
    return true;
  } else if (cache[sourceId] && cmd === "關閉天氣警特報通知") {
    repository.deleteSubscribedUserId({
      service_id: SERVICE_ID,
      user_id: sourceId,
    });
    cache[sourceId].cancel();
    cache[sourceId] = null;
    event.reply(`已關閉天氣警特報通知`);
    return true;
  } else if (cmd.startsWith("天氣警特報")) {
    var location = cmd.match(/天氣警特報(:(.*))?/)[2];
    var data = location ? await getWC0033001Data(location) : await getWC0033001Data();
    event.reply(toMsg(data));
    return true;
  } else if (cmd === "雷達回波") {
    event.reply(await getRadarPng());
    return true;
  } else if (cmd === "氣象觀測") {
    var data = await getOA0001001Data();
    event.reply(toMsg_OA0001001(data));
    return true;
  } else if (cmd == 'menu') {
    event.reply(flex.asMenu(['雷達回波', '空氣品質', '氣象觀測', '天氣警特報']));
    return true;
  }
  return false;
};

module.exports = service;



