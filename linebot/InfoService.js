

// bot狀態相關服務

var service = { bot: null };


const repository = require('../service/Repository');
const schedule = require("node-schedule");
const tools = require('../service/Tools');


var cache = {};
const JOB_SETTING = '0 0 9 * * 1-5';
// const JOB_SETTING = '0 * * * * 1-5';

// 啟動時自動觸發排程
var job = schedule.scheduleJob(JOB_SETTING, async () => {
    var bcs = await Promise.all(service.bot.bots.map(async (b) => {
        var count = await tools.getBotPushCount(b);
        return { bot: b, count: count };
    }));
    bcs = bcs.filter(x => x.count >= 450);
    if (bcs.length > 0) {
        var userIds = await repository.getDistinctSubscribedUserId();
        userIds.forEach(userId => {
            bcs.forEach(bc => bc.bot.push(userId, `我好像快死了...倒數${499 - bc.count}...`));
        });
    }
});


service.handle = async function (cmd, event) {
    if (cmd == 'pushCount') {
        var msgAr = await Promise.all(service.bot.bots.map(async (b) => {
            var count = await tools.getBotPushCount(b);
            var name = await tools.getBotName(b);
            return `${name}已push數量：${count}\n`;
        }));
        var msg = msgAr.reduce((a, b) => a + b);
        event.reply(msg);
        return true;
    }
    return false;
};

module.exports = service;


