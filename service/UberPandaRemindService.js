
var service = { bot: null };

const SERVICE_ID = `UberPandaRemindService`;
const schedule = require('node-schedule');
const repository = require('./Repository');
const tools = require('./Tools');

var cache = {};

const JOB_SETTING = '0 56 10 * * 1-5';
// const JOB_SETTING = '0 * * * * 1-5';

// 啟動時自動觸發排程
repository.getSubscribedUserId({ service_id: SERVICE_ID }, (response) => {
    var list = response.data.data.linebot_subscribed;
    list.forEach((elm) => {
        cache[elm.user_id] = schedule.scheduleJob(JOB_SETTING, function () {
            service.bot.push(elm.user_id, `今天要訂外送嗎？`);
        });
        console.log(`${SERVICE_ID} add cache ${elm.user_id}`);
    });
});

service.handle = function (cmd, event, bot) {
    var sourceId = tools.getSourceId(event);

    if (sourceId == null)
        return false;
    if (cmd === "開啟訂餐通知") {
        repository.createSubscribedUserId({ service_id: SERVICE_ID, user_id: sourceId });
        cache[sourceId] = schedule.scheduleJob(JOB_SETTING, function () {
            bot.push(sourceId, `今天要訂外送嗎？`);
        });
        bot.push(sourceId, `已開啟訂餐通知`);
        return true;
    } else if (cmd === "關閉訂餐通知") {
        repository.deleteSubscribedUserId({ service_id: SERVICE_ID, user_id: sourceId });
        cache[sourceId] && cache[sourceId].cancel();
        bot.push(sourceId, `已關閉訂餐通知`);
        return true;
    }
    return false;
};

module.exports = service;


