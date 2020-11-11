var service = { bot: null };

const SERVICE_ID = `AqiScheduleService`;

const repository = require('../service/Repository');
const tools = require('../service/Tools');
const schedule = require("node-schedule");
const axios = require('axios');

var cache = {};
const JOB_SETTING = '0 20 17 * * 1-5';
// const JOB_SETTING = '0 * * * * 1-5';

// 啟動時自動觸發排程
repository.getSubscribedUserId({ service_id: SERVICE_ID }, (response) => {
  var list = response.data.data.linebot_subscribed;
  list.forEach((elm) => {
    cache[elm.user_id] = schedule.scheduleJob(JOB_SETTING, async () => {
      var msg = await getAqiMsg();
      console.log(`msg=${msg}`);
      service.bot.push(elm.user_id, msg);
      console.log('service.bot.push');
    });
    console.log(`${SERVICE_ID} add cache ${elm.user_id}`);
  });
});


/**
 {
    "AQI": "89",
    "CO": "0.66",
    "CO_8hr": "0.5",
    "County": "高雄市",
    "ImportDate": "2020-11-06 08:32:46.330000",
    "Latitude": "22.674861",
    "Longitude": "120.292917",
    "NO": "8.8",
    "NO2": "23.1",
    "NOx": "31.9",
    "O3": "7.2",
    "O3_8hr": "8",
    "PM10": "74",
    "PM10_AVG": "69",
    "PM2.5": "34",
    "PM2.5_AVG": "31",
    "Pollutant": "細懸浮微粒",
    "PublishTime": "2020/11/06 08:00:00",
    "SO2": "3.6",
    "SO2_AVG": "4",
    "SiteId": "54",
    "SiteName": "左營",
    "Status": "普通",
    "WindDirec": "354",
    "WindSpeed": "2.2"
  }
 */
async function getAqiData() {
  const API_URL = 'https://data.epa.gov.tw/api/v1/aqx_p_432?limit=1000&api_key=c729d412-9be4-4dd5-9671-522d47d3a49f&format=json';

  var data = null;
  await axios.get(API_URL).then(function (response) {
    data = response.data.records.find(x => x.SiteName == '左營');
  });
  return data;
}

async function getAqiMsg() {
  var data = await getAqiData();
  return `左營站空氣品質即時監測資料：
資料時間：${data.PublishTime}, 
空氣品質指標 AQI：${data.AQI}(${data.Status}),
PM2.5：${data['PM2.5']},
資料來源：環保署空氣品質監測網
https://airtw.epa.gov.tw/CHT/EnvMonitoring/Central/CentralMonitoring.aspx
  `;
}


service.handle = function (cmd, event, bot) {
  var sourceId = tools.getSourceId(event);
  if (sourceId == null) return false;

  if (cmd === "開啟空氣品質通知") {
    repository.createSubscribedUserId({
      service_id: SERVICE_ID,
      user_id: sourceId,
    });
    if (!cache[sourceId]) {
      cache[sourceId] = schedule.scheduleJob(JOB_SETTING, async function () {
        var msg = await getAqiMsg();
        bot.push(sourceId, msg);
      });
      event.reply(`已開啟空氣品質通知`);
    }
    return true;
  } else if (cache[sourceId] && cmd === "關閉空氣品質通知") {
    repository.deleteSubscribedUserId({
      service_id: SERVICE_ID,
      user_id: sourceId,
    });
    cache[sourceId].cancel();
    cache[sourceId] = null;
    event.reply(`已關閉空氣品質通知`);
    return true;
  }
  return false;
};


module.exports = service;
