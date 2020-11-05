var service = { bot: null };

const SERVICE_ID = `ImsScheduleService`;
const tools = require("./Tools");
const repository = require("./Repository");
const schedule = require("node-schedule");
var cache = {};
const JOB_SETTING = '00 10 24-31 * 1-5';
// 啟動時自動觸發排程
repository.getSubscribedUserId({ service_id: SERVICE_ID }, (response) => {
  var list = response.data.data.linebot_subscribed;
  list.forEach((elm) => {
    cache[elm.user_id.toString()] = function () {
       bot.push(elm.user_id, `已啟動IMS回報`);
      schedule.scheduleJob(JOB_SETTING, function () {
        bot.push(
          elm.user_id,
          `今天是本月最後一個工作天,請各位記得上IMS回報每月工時.`
        );
        cache[sourceId]();
      });
    };
    console.log(`UberPandaRemindService add cache ${elm.user_id}`);
  });
});

service.handle = function (cmd, event, bot) {
  var sourceId = tools.getSourceId(event);
  if (sourceId == null) return false;
  if (cmd === "啟動IMS回報") {
    repository.createSubscribedUserId({
      service_id: SERVICE_ID,
      user_id: sourceId,
    });
    cache[sourceId] = function () {
      bot.push(sourceId, `已啟動IMS回報`);
      schedule.scheduleJob(JOB_SETTING, function () {
        bot.push(
          sourceId,
          `今天是本月最後一個工作天,請各位記得上IMS回報每月工時.`
        );
        cache[sourceId]();
      });
    };
    cache[sourceId]();
    return true;
  } else if (cmd === "關閉IMS回報") {
    repository.deleteSubscribedUserId({
      service_id: SERVICE_ID,
      user_id: sourceId,
    });
    cache[sourceId] = function () {};
    bot.push(sourceId, `已關閉IMS回報`);
    return true;
  }
  return false;
};


module.exports = service;
