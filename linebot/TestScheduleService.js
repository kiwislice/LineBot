var service = { bot: null };

const SERVICE_ID = `TestScheduleService`;

const repository = require('../service/Repository');
const tools = require('../service/Tools');
const schedule = require("node-schedule");

var cache = {};
const JOB_SETTING = '0 * * * * 1-5';
// const JOB_SETTING = '0 * * * * 1-5';

// 啟動時自動觸發排程
repository.getSubscribedUserId({ service_id: SERVICE_ID }, (response) => {
  var list = response.data.data.linebot_subscribed;
  list.forEach((elm) => {
    cache[elm.user_id] = schedule.scheduleJob(JOB_SETTING, function () {
      doSomething(elm.user_id);
    });
    console.log(`${SERVICE_ID} add cache ${elm.user_id}`);
  });
});

function doSomething(sourceId) {
  service.bot.push(sourceId, '排程測試');
}


service.handle = function (cmd, event) {
  var sourceId = tools.getSourceId(event);
  if (sourceId == null) return false;

  if (cmd === "開啟排程測試通知") {
    repository.createSubscribedUserId({
      service_id: SERVICE_ID,
      user_id: sourceId,
    });
    if (!cache[sourceId]) {
      cache[sourceId] = schedule.scheduleJob(JOB_SETTING, function () {
        doSomething(sourceId);
      });
      event.reply(`已開啟排程測試通知`);
    }
    return true;
  } else if (cache[sourceId] && cmd === "關閉排程測試通知") {
    repository.deleteSubscribedUserId({
      service_id: SERVICE_ID,
      user_id: sourceId,
    });
    cache[sourceId].cancel();
    cache[sourceId] = null;
    event.reply(`已關閉排程測試通知`);
    return true;
  }
  return false;
};


module.exports = service;
