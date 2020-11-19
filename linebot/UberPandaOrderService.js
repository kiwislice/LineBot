
var service = { bot: null };

const SERVICE_ID = `UberPandaOrderService`;
const { json } = require('express');
const tools = require('../service/Tools');

var cache = {};

/**
 * 是否為開始點餐指令
 * @param {string} cmd 
 */
function isStartCmd(cmd) {
    return !!cmd.match(/開始點餐/);
}

/**
 * 是否為結束點餐指令
 * @param {string} cmd 
 */
function isEndCmd(cmd) {
    return !!cmd.match(/^(截止|結束|停止)點餐|點餐(截止|結束|停止)/);
}

service.handle = async function (cmd, event, currentBot) {
    var sourceId = tools.getSourceId(event);
    if (sourceId == null)
        return false;
    if (isStartCmd(cmd)) {
        cache[sourceId] = { enable: true, list: {} };
        event.reply(`以下開放點餐，餐點名稱前面請加/\n範例：/雞肉飯`);
        return true;
    } else if (cache[sourceId] && isEndCmd(cmd)) {
        cache[sourceId].enable = false;
        event.reply(`點餐截止`);
        return true;
    } else if (cache[sourceId] && cache[sourceId].enable && cmd.startsWith("/")) {
        var data = cache[sourceId].list[event.source.userId] || {};
        var item = cmd.replace(/^\/+/, '');
        data.item = item;
        data.username = data.username || await tools.getUserName(event, currentBot);
        cache[sourceId].list[event.source.userId] = data;
        event.reply(`接受點餐：${data.username} ${data.item}`);
        return true;
    } else if (cache[sourceId] && cmd === "清單") {
        var list = cache[sourceId].list;
        var msg = `已接受清單：\n`;
        for (var userId in list) {
            msg += `${list[userId].username}: ${list[userId].item}\n`;
        }
        event.reply(msg);
        return true;
    }
    return false;
};

module.exports = service;


