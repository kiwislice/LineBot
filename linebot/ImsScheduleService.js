var service = { bot: null };

const SERVICE_ID = `ImsScheduleService`;
const repository = require("../service/Repository");
const tools = require("../service/Tools");
const schedule = require("node-schedule");
const axios = require("axios");
var cache = {};

const JOB_SETTING = "00 10 24-31 * 1-5";
//const JOB_SETTING = "*/1 * * * *";

// 啟動時自動觸發排程
repository.getSubscribedUserId({ service_id: SERVICE_ID }, (response) => {
  var list = response.data.data.linebot_subscribed;
  list.forEach((elm) => {
   cache[elm.user_id] = ImsSchedule(elm.user_id);
    console.log(`ImsScheduleService add cache ${elm.user_id}`);
  });
});

service.handle = async function (cmd, event) {
  var sourceId = tools.getSourceId(event);
  if (sourceId == null) return false;
  if (cmd === "啟動IMS回報") {
    repository.createSubscribedUserId({
      service_id: SERVICE_ID,
      user_id: sourceId,
    });
    event.reply(`已啟動IMS回報`);
    cache[sourceId] = ImsSchedule(sourceId);
    return true;
  } else if (cmd === "關閉IMS回報") {
    repository.deleteSubscribedUserId({
      service_id: SERVICE_ID,
      user_id: sourceId,
    });
    cache[sourceId].cancel();
    event.reply(`已關閉IMS回報`);
    return true;
  }
  return false;
};
function ImsSchedule(sourceId){
 return schedule.scheduleJob(JOB_SETTING, function () {
    console.log(`schedule run ${SERVICE_ID}`);
    var date = new Date();
    var today = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    var lastWeekDay = today.getDate() - today.getDay() + 1;
    if (lastWeekDay <= date.getDate()) {
      service.bot.push(
        sourceId,
        `本週是這個月的最後一個工作週，請記得在本月的最後一天上IMS回報工作時數，若有請假的請提前回報!!!.`
      );
    }
  });
}
module.exports = service;
