var service = { bot: null };

const SERVICE_ID = `WeatherService`;

const repository = require('../service/Repository');
const tools = require('../service/Tools');
const schedule = require("node-schedule");
const axios = require('axios');
const flex = require('../service/FlexMeaaageRandemCard');

var cache = {};
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
        service.bot.push(elm.user_id, toMsg(data));
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
 */
async function getWC0033001Data() {
  const API_URL = `https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/W-C0033-001?Authorization=${Authorization}&downloadType=WEB&format=JSON`;
  var data = {};
  await axios.get(API_URL).then(function (response) {
    try {
      // 發布時間
      data.sent = new Date(response.data.cwbopendata.sent);
      var kao = response.data.cwbopendata.dataset.location.filter(x => x.locationName == '高雄市')[0];
      console.log(kao);
      kao = kao.hazardConditions.hazards;
      console.log(kao);
      data.info = kao.info.phenomena + kao.info.significance;
      data.startTime = new Date(kao.validTime.startTime);
      data.endTime = new Date(kao.validTime.endTime);
      data.affectedAreas = kao.hazard.info.affectedAreas.location.map(x => x.locationName);
    } catch (e) {
      data = null;
    }
    // {
    //     "geocode": "10002",
    //     "hazardConditions": {
    //         "hazards": {
    //             "hazard": {
    //                 "info": {
    //                     "affectedAreas": {
    //                         "location": [
    //                             {
    //                                 "locationName": "山區"
    //                             },
    //                             {
    //                                 "locationName": "平地"
    //                             }
    //                         ]
    //                     },
    //                     "language": "zh-TW",
    //                     "phenomena": "大雨"
    //                 }
    //             },
    //             "info": {
    //                 "language": "zh-TW",
    //                 "phenomena": "大雨",
    //                 "significance": "特報"
    //             },
    //             "validTime": {
    //                 "endTime": "2020-11-24T11:00:00+08:00",
    //                 "startTime": "2020-11-24T04:16:00+08:00"
    //             }
    //         }
    //     },
    //     "locationName": "宜蘭縣"
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

  var msg = `高雄市${data.info}\n`;
  msg += `發布時間：${tools.toYMDHMS(data.sent)}\n`;
  msg += `開始時間：${tools.toYMDHMS(data.startTime)}\n`;
  msg += `結束時間：${tools.toYMDHMS(data.endTime)}\n`;
  msg += `影響範圍：${data.affectedAreas}\n`;
  // {
  //   "sent": "2020-11-24T04:21:48+08:00",
  //   "info": "大雨特報",
  //   "startTime": "2020-11-24T04:16:00+08:00",
  //   "endTime": "2020-11-24T11:00:00+08:00",
  //   "affectedAreas": ["山區", "平地"]
  // }
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
  } else if (cmd === "天氣警特報") {
    var data = await getWC0033001Data();
    event.reply(toMsg(data));
    return true;
  } else if (cmd === "雷達回波") {
    event.reply(await getRadarPng());
    return true;
  } else if (cmd == 'menu') {
    event.reply(flex.asMenu(['雷達回波', '空氣品質', '天氣警特報']));
    return true;
  }
  return false;
};

module.exports = service;
