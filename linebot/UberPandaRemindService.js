
var service = { bot: null };

const SERVICE_ID = `UberPandaRemindService`;
const schedule = require('node-schedule');
const repository = require('../service/Repository');
const tools = require('../service/Tools');
const card = require('../service/FlexMeaaageRandemCard');

var jobs = {};
var cache = {};

// 訂外送的最低人數
const PEOPLE_LOWER_BOUND = 3;
const JOB_SETTING = '0 30 10 * * 1-5';
// const JOB_SETTING = '0 * * * * 1-5';

const MSG = `今天要訂外送嗎？
想訂的人請在10:50之前喊+1，不足${PEOPLE_LOWER_BOUND}人就不訂了哦～
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

// 開始提醒
function startRemind(sourceId) {
    service.bot.push(sourceId, MSG);
    cache[sourceId] = { enable: true, ids: {}, timeout: null };
    cache[sourceId].timeout = setTimeout(() => {
        cache[sourceId].enable = false;
        var count = getCount(sourceId);
        var submsg = count < PEOPLE_LOWER_BOUND ? '今天不訂餐' : '快決定店家點餐吧';
        service.bot.push(sourceId, `統計人數共${count}人，${submsg}`);
    }, 20 * 60 * 1000);
}

// 取得+1數量
function getCount(sourceId) {
    var count = 0;
    if (cache[sourceId]) {
        for (const id in cache[sourceId].ids) {
            count++;
        }
    }
    return count;
}

async function randomStoresMsg(n) {
    var stores = await repository.randomStores(n);
    // var msg = stores.map(x => `${x.name}\n${x.url}\n\n`).reduce((a, b) => a + b);
    // console.log(JSON.stringify(stores))
     msg = card.getRestaurantButton(stores);
    return msg;
}

service.handle = async function (cmd, event) {
    var sourceId = tools.getSourceId(event);

    if (sourceId == null)
        return false;
    if (cmd === "開啟訂餐通知") {
        repository.createSubscribedUserId({ service_id: SERVICE_ID, user_id: sourceId });
        jobs[sourceId] = schedule.scheduleJob(JOB_SETTING, function () {
            startRemind(sourceId);
        });
        event.reply(`已開啟訂餐通知`);
        return true;
    } else if (cmd === "關閉訂餐通知") {
        repository.deleteSubscribedUserId({ service_id: SERVICE_ID, user_id: sourceId });
        jobs[sourceId] && jobs[sourceId].cancel();
        event.reply(`已關閉訂餐通知`);
        return true;
    } else if (cache[sourceId] && cache[sourceId].enable && cmd.indexOf('+1') >= 0) {
        cache[sourceId].ids[event.source.userId] = 1;
        var count = getCount(sourceId);
        if (count >= PEOPLE_LOWER_BOUND) {
            clearTimeout(cache[sourceId].timeout);
            cache[sourceId].enable = false;
            var msg = `+1人數已滿${PEOPLE_LOWER_BOUND}人，快決定店家點餐吧\n以下為本次助理推薦店家：\n`;
            msg += await randomStoresMsg(3);
            event.reply(msg);
        }
        return true;
    } else if (cmd.indexOf("要吃什麼") >= 0) {
        var storesMsg = await randomStoresMsg(3);
        event.reply(storesMsg);
        return true;
    }
    return false;
};

module.exports = service;


