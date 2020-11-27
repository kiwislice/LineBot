
var service = { bot: null };

const SERVICE_ID = `UberPandaRemindService`;
const schedule = require('node-schedule');
const repository = require('../service/Repository');
const tools = require('../service/Tools');
const card = require('../service/FlexMeaaageRandemCard');

/**排程啟動狀況 */
var jobs = {};
/**訂餐提醒過程暫存區 */
var cache = {};

const JOB_SETTING = '0 0 10 * * 1-5';
/**訂外送的最低人數*/
const PEOPLE_LOWER_BOUND = 3;
/**等待報名時間 */
const WAIT_SIGN_UP_MS = 30 * 60 * 1000;
/**等待投票時間 */
const WAIT_VOTE_MS = 20 * 60 * 1000;
/**隨機抽選店家數量*/
const RANDOM_STORE_COUNT = 3;

// 測試用
// const PEOPLE_LOWER_BOUND = 1;
// const WAIT_SIGN_UP_MS = 30 * 1000;
// const WAIT_VOTE_MS = 20 * 1000;

const MSG = `今天要訂外送嗎？
想訂的人請在10:30之前喊+1，不足${PEOPLE_LOWER_BOUND}人就不訂了哦～
https://kiwislice.github.io/UberPanda/#/`;

// 啟動時自動觸發排程
repository.getSubscribedUserId({ service_id: SERVICE_ID }, (response) => {
    var list = response.data.data.linebot_subscribed;
    list.forEach((elm) => {
        jobs[elm.user_id] = schedule.scheduleJob(JOB_SETTING, function () {
            console.log(`schedule run ${SERVICE_ID}`);
            startRemind(elm.user_id, service.bot);
        });
        console.log(`${SERVICE_ID} add cache ${elm.user_id}`);
    });
});


const CACHE_DATA_OBJ = {
    onSignUp: false, // 報名中
    ids: {},
    timeout: null,
    onVote: false, //投票中
    stores: [],
};

/**開始提醒*/
function startRemind(sourceId, bot) {
    if (cache[sourceId] && cache[sourceId].timeout) {
        clearTimeout(cache[sourceId].timeout);
    }

    bot.push(sourceId, MSG);
    cache[sourceId] = Object.assign({}, CACHE_DATA_OBJ);
    cache[sourceId].onSignUp = true;
    cache[sourceId].timeout = setTimeout(() => {
        cache[sourceId].onSignUp = false;
        var count = getCount(sourceId);
        var submsg = count < PEOPLE_LOWER_BOUND ? '今天不訂餐' : '快決定店家點餐吧';
        bot.push(sourceId, `統計人數共${count}人，${submsg}`);
    }, WAIT_SIGN_UP_MS);
}

/**取得+1數量 */
function getCount(sourceId) {
    var count = 0;
    if (cache[sourceId]) {
        for (const id in cache[sourceId].ids) {
            count += cache[sourceId].ids[id];
        }
    }
    return count;
}

/**
 * 是否為+X或-X指令
 * @param {string} cmd 
 */
function isPlusXCmd(cmd) {
    return cmd.match(/^(\+|-)[0-9.]+/) && (+cmd) != NaN;
}

/**
 * 是否為報名中
 * @param {string} sourceId 
 */
function isOnSignUp(sourceId) {
    return cache[sourceId] && cache[sourceId].onSignUp;
}

/**
 * 是否為投票中
 * @param {string} sourceId 
 */
function isOnVote(sourceId) {
    return cache[sourceId] && cache[sourceId].onVote;
}

/**開始投票 */
async function startVote(sourceId, bot) {
    if (cache[sourceId] && cache[sourceId].timeout) {
        clearTimeout(cache[sourceId].timeout);
    }

    cache[sourceId] = Object.assign({}, CACHE_DATA_OBJ);
    cache[sourceId].onVote = true;
    cache[sourceId].ids = {};

    var endTime = new Date(Date.now() + WAIT_VOTE_MS);
    var voteMsg = `請使用"/序號"投票，範例/1。\n投票將於${tools.toHMS(endTime)}結束。\n輸入"重抽"可刷新店家清單\n`;
    var uberPandaLink = [{
        type: "button",
        // style: "primary",
        action: {
            type: "uri",
            label: `UberPanda所有店家清單`,
            uri: `https://kiwislice.github.io/UberPanda/#/`,
        },
    }];

    cache[sourceId].stores = await repository.randomStores(RANDOM_STORE_COUNT);
    cache[sourceId].stores.forEach(elm => elm.vote = 0);
    var msg = card.getRestaurantButton(cache[sourceId].stores, voteMsg, uberPandaLink);
    bot.push(sourceId, msg);

    cache[sourceId].timeout = setTimeout(() => {
        cache[sourceId].onVote = false;
        for (const userId in cache[sourceId].ids) {
            var index = cache[sourceId].ids[userId];
            cache[sourceId].stores[index].vote++;
        }
        cache[sourceId].stores.sort((a, b) => b.vote - a.vote);
        var msg = '公布投票結果，本次前3名為：\n';
        for (var i = 0; i < 3; i++) {
            msg += `第${i + 1}名. ${cache[sourceId].stores[i].name}(${cache[sourceId].stores[i].vote}票)\n`;
        }
        bot.push(sourceId, msg);
    }, WAIT_VOTE_MS);
}

service.handle = async function (cmd, event, currentBot) {
    var sourceId = tools.getSourceId(event);

    if (sourceId == null)
        return false;
    if (cmd === "開啟訂餐通知") {
        repository.createSubscribedUserId({ service_id: SERVICE_ID, user_id: sourceId });
        jobs[sourceId] = schedule.scheduleJob(JOB_SETTING, function () {
            console.log(`schedule run ${SERVICE_ID}`);
            startRemind(sourceId, currentBot);
        });
        event.reply(`已開啟訂餐通知`);
        return true;
    } else if (cmd === "關閉訂餐通知") {
        repository.deleteSubscribedUserId({ service_id: SERVICE_ID, user_id: sourceId });
        jobs[sourceId] && jobs[sourceId].cancel();
        event.reply(`已關閉訂餐通知`);
        return true;
    } else if (isOnSignUp(sourceId) && cmd.indexOf('+1') >= 0) {
        cache[sourceId].ids[event.source.userId] = 1;
        var count = getCount(sourceId);
        if (count >= PEOPLE_LOWER_BOUND) {
            clearTimeout(cache[sourceId].timeout);
            cache[sourceId].onSignUp = false;
            event.reply(`+1人數已滿${PEOPLE_LOWER_BOUND}人，以下開始投票決定店家。`);
            startVote(sourceId, currentBot);
        } else {
            var username = await tools.getUserName(event, currentBot);
            event.reply(`${username}+1`);
        }
        return true;
    } else if (isOnSignUp(sourceId) && isPlusXCmd(cmd)) {
        var username = await tools.getUserName(event, currentBot);
        var num = +cmd;
        if (num < 1) {
            cache[sourceId].ids[event.source.userId] = 0;
            event.reply(`好的，本次${username}不參加`);
            return true;
        }
    } else if (cmd.indexOf("要吃什麼") >= 0) {
        if (isOnVote(sourceId)) {
            event.reply(`投票進行中，暫時停用隨機抽店家功能`);
            return true;
        }
        var stores = await repository.randomStores(RANDOM_STORE_COUNT);
        var storesMsg = card.getRestaurantButton(stores);
        event.reply(storesMsg);
        return true;
    } else if (isOnVote(sourceId) && cmd.match(/^\/[1-9]$/)) {
        var seqNo = +cmd.match(/^\/([1-9])$/)[1] - 1;
        if (seqNo >= 0 && seqNo < cache[sourceId].stores.length) {
            cache[sourceId].ids[event.source.userId] = seqNo;
            var username = await tools.getUserName(event, currentBot);
            event.reply(`${username}投給了${cache[sourceId].stores[seqNo].name}`);
            return true;
        }
    } else if (isOnVote(sourceId) && cmd == "重抽") {
        startVote(sourceId, currentBot);
        return true;
    } else if (cmd == "startVote") {
        startVote(sourceId, currentBot);
        return true;
    } else if (cmd == "startRemind") {
        startRemind(sourceId, currentBot);
        return true;
    }
    return false;
};

module.exports = service;


