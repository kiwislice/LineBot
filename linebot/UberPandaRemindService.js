
var service = { bot: null };

const SERVICE_ID = `UberPandaRemindService`;
const schedule = require('node-schedule');
const repository = require('../service/Repository');
const tools = require('../service/Tools');

var jobs = {};
var cache = {};

const JOB_SETTING = '0 30 10 * * 1-5';
// const JOB_SETTING = '0 * * * * 1-5';

const MSG = `今天要訂外送嗎？
想訂的人請在10:50之前喊+1，不足3人就不訂了哦～
https://kiwislice.github.io/UberPanda/#/`;

// 啟動時自動觸發排程
repository.getSubscribedUserId({ service_id: SERVICE_ID }, (response) => {
    var list = response.data.data.linebot_subscribed;
    list.forEach((elm) => {
        jobs[elm.user_id] = schedule.scheduleJob(JOB_SETTING, function () {
            startRemind(elm.user_id);
        });
        console.log(`${SERVICE_ID} add cache ${elm.user_id}`);
    });
});

function startRemind(sourceId) {
    service.bot.push(sourceId, MSG);
    cache[sourceId] = { enable: true, ids: {} };
    setTimeout(() => {
        cache[sourceId].enable = false;
        var count = 0;
        for (const id in cache[sourceId].ids) {
            count++;
        }
        var submsg = count < 3 ? '今天不訂餐' : '快決定店家點餐吧';
        service.bot.push(sourceId, `統計人數共${count}人，${submsg}`);
    }, 20 * 60 * 1000);
}

service.handle = function (cmd, event) {
    var sourceId = tools.getSourceId(event);

    if (sourceId == null)
        return false;
    if (cmd === "開啟訂餐通知") {
        repository.createSubscribedUserId({ service_id: SERVICE_ID, user_id: sourceId });
        jobs[sourceId] = schedule.scheduleJob(JOB_SETTING, function () {
            startRemind(sourceId);
        });
        event.reply(sourceId, `已開啟訂餐通知`);
        return true;
    } else if (cmd === "關閉訂餐通知") {
        repository.deleteSubscribedUserId({ service_id: SERVICE_ID, user_id: sourceId });
        jobs[sourceId] && jobs[sourceId].cancel();
        event.reply(sourceId, `已關閉訂餐通知`);
        return true;
    } else if (cache[sourceId] && cache[sourceId].enable && cmd.indexOf('+1') >= 0) {
        cache[sourceId].ids[event.source.userId] = 1;
        return true;
    }
    return false;
};

module.exports = service;


